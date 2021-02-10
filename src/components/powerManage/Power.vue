<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>电费管理</el-breadcrumb-item>
            <el-breadcrumb-item>查询电费</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入楼栋号搜索" v-model="queryInfo.query" clearable @clear="getDmtyList">
                        <el-button slot="append" icon="el-icon-search" @click="getDmtyList"></el-button>
                    </el-input>
                </el-col>
            </el-row>
            <el-table :data="powerData" style="width: 100%;margin-bottom: 20px;" row-key="id" border :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="dmtyId" label="门牌号"></el-table-column>
                <el-table-column label="标识">
                    <template v-slot="scope">
                        <el-tag type="primary" v-if="scope.row.identify == 1">楼栋</el-tag>
                        <el-tag type="success" v-else>宿舍</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="accountBalance" label="电费余额">
                    <template v-slot="scope">
                        <div v-if="scope.row.identify == 1">点击左侧">"展开</div>
                        <div v-else>
                            <p v-if="scope.row.accountBalance == ''">0</p>
                            <p v-else>{{scope.row.accountBalance}}</p>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="账户状态">
                    <template v-slot="scope">
                        <div v-if="scope.row.identify == 1">点击左侧">"展开</div>
                        <div v-else>
                            <el-tag type="success" v-if="scope.row.accountBalance > 0">正常</el-tag>
                            <el-tag type="danger" v-else>欠费</el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="275">
                    <template v-slot="scope">
                        <div v-if="scope.row.identify == 1">点击左侧">"展开</div>
                        <div v-else>
                            <!-- 手动缴费 -->
                            <el-tooltip effect="dark" content="手动缴费" placement="top" :enterable="false">
                                <el-button type="primary" icon="el-icon-circle-plus-outline" size="mini" @click="openPayDialog(scope.row)">手动缴费</el-button>
                            </el-tooltip>
                            <!-- 缴费订单查询 -->
                            <el-tooltip effect="dark" content="订单查询" placement="top" :enterable="false">
                                <el-button type="success" icon="el-icon-s-order" size="mini" @click="getOrderList(scope.row.id)">订单查询</el-button>
                            </el-tooltip>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[60, 180, 300, 600]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
            </el-pagination>
            <!-- 手动缴费对话框 -->
            <el-dialog title="手动缴费" :visible.sync="payDialogVisible" width="300px">
                <el-form ref="payFormRef" :model="payForm" :rules="formRules" label-width="90px" >
                    <el-form-item label="宿舍号:">
                        <el-input prefix-icon="el-icon-user-solid" v-model="payForm.dmtyId" placeholder="宿舍号" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="缴费金额:" prop="payBalance">
                        <el-input-number v-model="payForm.payBalance" :min="50" :max="1000" :step="50" style="width:100%"></el-input-number>
                    </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="payDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addBalance('payFormRef')">确 定</el-button>
                </span>
            </el-dialog>
            <!-- 查看电费缴纳订单 -->
            <el-dialog title="订单记录" :visible.sync="orderDialogVisible" width="60%">
                <el-table :data="orderList">
                    <el-table-column property="payDate" label="缴费日期" width="200">
                        <template v-slot="scope">{{scope.row.payDate | dateFormat1 }}</template>
                    </el-table-column>
                    <el-table-column property="dmtyId" label="宿舍号"></el-table-column>
                    <el-table-column property="payBalance" label="缴费金额"></el-table-column>
                    <el-table-column property="user" label="缴费人"></el-table-column>
                    <el-table-column label="订单状态">
                        <template v-slot="scope">
                            <el-tag type="warning" v-if="scope.row.orderState == 1">待支付</el-tag>
                            <el-tag type="success" v-else-if="scope.row.orderState == 2">已支付</el-tag>
                            <el-tag type="danger" v-else>取消订单</el-tag>
                        </template>
                    </el-table-column>
                </el-table>
            </el-dialog>
        </el-card>
        <el-backtop><i class="el-icon-caret-top"></i></el-backtop>
    </div>
</template>
<script>
export default {
    data() {
        return {
            queryInfo: {
                query: '',
                // 当前页数
                pagenum: 1,
                // 当前每一页显示多少条数据
                pagesize: 60
            },
            total: 1,
            powerData: [],
            payDialogVisible: false,
            listDialogVisible: false,
            payForm: {},
            formRules: {
                payBalance: [
                    { required: true, message: '请输入缴费金额', trigger: 'blur' }
                ]
            },
            orderDialogVisible: false,
            orderList: [],
            selectedId: ''
        }
    },
    created () {
        this.getDmtyList()
    },
    methods: {
        async getDmtyList() {
            const { data: res } = await this.$http.get('power', { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$message.error('获取宿舍电费信息失败')
            this.powerData = res.data.dormitory
            this.total = res.data.total
        },
        // 监听pagesize改变的事件
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getDmtyList()
        },
        // 监听页码值current-page改变的事件
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getDmtyList()
        },
        openPayDialog(row) {
            this.payForm.dmtyId = row.dmtyId
            this.selectedId = row.id
            this.payDialogVisible = true
        },
        addBalance(formName) {
            this.$refs[formName].validate(async valid => {
                if (valid) {
                    const { data: res } = await this.$http.put('power/recharge/' + this.selectedId, { payBalance: this.payForm.payBalance })
                    if (res.meta.status !== 200) return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
                    this.$message({ type: 'success', center: true, message: '为' + this.payForm.dmtyId + '缴费' + this.payForm.payBalance + '成功!', showClose: true })
                    this.payDialogVisible = false
                    this.getDmtyList()
                } else {
                    alert('验证不通过,请填写充值金额!!')
                    return false
                }
            })
        },
        async getOrderList(id) {
            const { data: res } = await this.$http.get('power/order/' + id)
            if (res.meta.status !== 200) return this.$message.error('获取宿舍电费订单信息失败')
            this.orderList = res.data
            this.orderDialogVisible = true
        }
    }
}
</script>
<style lang="less" scoped>
</style>
