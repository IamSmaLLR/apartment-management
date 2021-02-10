<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>电费管理</el-breadcrumb-item>
            <el-breadcrumb-item>电费缴纳</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card style="width:580px">
            <el-form ref="payFormRef" :model="payForm" :rules="formRules" label-width="90px" >
                <el-form-item label="门牌号:" prop="dmtyId">
                    <el-cascader placeholder="楼栋/房间" v-model="payForm.dmtyId" :options="roomOption" clearable style="width:69%; margin-right:12px"></el-cascader>
                    <el-button type="warning" @click="getDmtyBalance()">查询宿舍电费</el-button>
                </el-form-item>
                <el-form-item label="缴费金额:" prop="payBalance">
                    <el-input-number v-model="payForm.payBalance" :min="50" :max="1000" :step="50" style="width:100%"></el-input-number>
                </el-form-item>
                <el-form-item label="支付方式:" prop="payMethod">
                    <el-row :gutter="15">
                        <el-col :span="11">
                            <el-card :body-style="{ padding: '0px' }">
                                <img src="../../assets/微信支付.png">
                                <div style="padding: 5px 50px;">
                                    <el-radio v-model="payForm.payMethod" label="微信支付"></el-radio>
                                </div>
                            </el-card>
                        </el-col>
                        <el-col :span="11">
                            <el-card :body-style="{ padding: '0px' }">
                                <img src="../../assets/支付宝.png">
                                <div style="padding: 5px 50px;">
                                    <el-radio v-model="payForm.payMethod" label="支付宝支付"></el-radio>
                                </div>
                            </el-card>
                        </el-col>
                    </el-row>
                </el-form-item>
                <div class="btn">
                    <el-button type="primary" @click="OpenPayDialog('payFormRef')">确 定</el-button>
                    <el-button @click="resetForm('payFormRef')">重 置</el-button>
                </div>
            </el-form>
            <el-dialog
                title="确认支付"
                :visible.sync="payDialogVisible"
                width="400px"
                @close="resetForm('orderFormRef')">
                <el-form ref="orderFormRef" :model="orderForm" label-width="90px" >
                    <el-form-item label="楼栋号:">
                        <el-input v-model="orderForm.buildingId" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="宿舍号:">
                        <el-input v-model="orderForm.roomId" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="缴费金额:">
                        <el-input v-model="orderForm.payBalance" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="支付方式:">
                        <el-input v-model="orderForm.payMethod" disabled></el-input>
                    </el-form-item>
                    <el-alert title="注意：扫码支付后再确认请备注学号姓名宿舍号！" type="warning" show-icon></el-alert>
                    <img src="http://127.0.0.1:8888/public/assets/zfb.jpg" alt="zfb收款码" v-if="orderForm.payMethod == '支付宝支付'" style="width:100%;">
                    <img src="http://127.0.0.1:8888/public/assets/wx.jpg" alt="zfb收款码" v-else-if="orderForm.payMethod == '微信支付'" style="width:100%;">
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="payDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addOrder()">确 定</el-button>
                </span>
            </el-dialog>
        </el-card>
    </div>
</template>
<script>
export default {
    data() {
        return {
            payForm: {
                payMethod: '微信支付'
            },
            orderForm: {},
            roomOption: [],
            formRules: {
                dmtyId: [
                    { required: true, message: '请选择楼栋/宿舍', trigger: 'change' }
                ],
                payBalance: [
                    { required: true, message: '请填写缴费金额', trigger: 'blur' }
                ]
            },
            payDialogVisible: false
        }
    },
    created () {
        this.getRoomOption()
    },
    methods: {
        async getRoomOption() {
            const { data: res } = await this.$http.get('dormitory/cascader/info')
            if (res.meta.status !== 200) return this.$message.error('查询楼栋宿舍失败！')
            this.roomOption = res.data
        },
        async getDmtyBalance() {
            if (this.payForm.dmtyId) {
                const { data: res } = await this.$http.get('power/query', { params: { buildingId: this.payForm.dmtyId[0], roomId: this.payForm.dmtyId[1] } })
                if (res.meta.status !== 200) return this.$message.error('查询宿舍电费失败！')
                this.$alert(`${parseInt(res.data.buildingId)}号楼${res.data.roomId}宿舍，电费余额为${res.data.accountBalance}元`, '电费余额', { confirmButtonText: '确定' })
            } else {
                alert('请先选择楼栋/宿舍!!')
            }
        },
        OpenPayDialog(formName) {
            this.$refs[formName].validate(valid => {
                if (valid) {
                    this.orderForm.buildingId = this.payForm.dmtyId[0]
                    this.orderForm.roomId = this.payForm.dmtyId[1]
                    this.orderForm.payBalance = this.payForm.payBalance
                    this.orderForm.payMethod = this.payForm.payMethod
                    this.payDialogVisible = true
                } else {
                    alert('验证不通过,失败!!')
                    return false
                }
            })
        },
        async addOrder() {
            const { data: res } = await this.$http.post('power', this.orderForm)
            if (res.meta.status !== 201) return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
            this.$message({ type: 'success', center: true, message: '添加缴费订单成功!', showClose: true })
            this.payDialogVisible = false
        },
        resetForm(formName) {
            this.$refs[formName].resetFields()
        }
    }
}
</script>
<style lang="less" scoped>
.btn{
    position: relative;
    left:200px;
}
</style>
