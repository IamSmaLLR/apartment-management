<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>住宿管理</el-breadcrumb-item>
            <el-breadcrumb-item>调整申请</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <span id="title">填写宿舍调整申请单</span>
            <el-badge :value="listLength" class="item watchbtn" v-if="listLength !== 0">
                <el-button size="small" type="primary" @click="dialogTableVisible = true;getSubmitList()">查看申请单</el-button>
            </el-badge>
            <el-button size="small" type="primary" @click="dialogTableVisible = true" class="watchbtn" v-else>查看申请单</el-button>
            <el-form :model="applyForm" ref="applyForm" label-width="100px" class="demo-ruleForm" style="margin-top:10px">
                <el-form-item label="学号:" prop="userid">
                    <el-input prefix-icon="el-icon-user-solid" v-model="applyForm.userid" placeholder="学号" disabled></el-input>
                </el-form-item>
                <el-form-item label="姓名:" prop="username">
                    <el-input prefix-icon="el-icon-collection-tag" v-model="applyForm.username" placeholder="姓名" disabled></el-input>
                </el-form-item>
                <el-form-item label="原因:" prop="reason">
                    <el-input v-model="applyForm.reason" type="textarea" rows="15"></el-input>
                </el-form-item>
            </el-form>
            <div class="btn">
                <el-button type="primary" @click="applyAdjust()">提 交</el-button>
                <el-button @click="resetForm('applyForm')">重 置</el-button>
            </div>
            <!-- 查看申请单对话框 -->
            <el-dialog title="已提交的调整宿舍申请单" :visible.sync="dialogTableVisible" width="60%">
                <el-table :data="tableList">
                    <el-table-column label="申请日期" width="150">
                        <template v-slot="scope">{{scope.row.submitDate | dateFormat1}}</template>
                    </el-table-column>
                    <el-table-column property="userid" label="学号"></el-table-column>
                    <el-table-column property="username" label="姓名"></el-table-column>
                    <el-table-column label="性别">
                        <template v-slot="scope">
                            <p v-if="scope.row.sex == 1">男</p>
                            <p v-else>女</p>
                        </template>
                    </el-table-column>
                    <el-table-column label="转入楼栋" width="90">
                        <template v-slot="scope">
                            <el-tag type="warning" v-if="scope.row.approvalState == 1">等待审批</el-tag>
                            <el-tag v-else-if="scope.row.approvalState == 2">暂未分配</el-tag>
                            <el-tag type="danger" v-else-if="scope.row.approvalState == 3">已驳回</el-tag>
                            <el-tag type="success" v-else>{{scope.row.buildingId}}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="转入宿舍" width="90">
                        <template v-slot="scope">
                            <el-tag type="warning" v-if="scope.row.approvalState == 1">等待审批</el-tag>
                            <el-tag v-else-if="scope.row.approvalState == 2">暂未分配</el-tag>
                            <el-tag type="danger" v-else-if="scope.row.approvalState == 3">已驳回</el-tag>
                            <el-tag type="success" v-else>{{scope.row.roomId}}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="审批状态">
                        <template v-slot="scope">
                            <el-tag type="warning" v-if="scope.row.approvalState == 1">待审批</el-tag>
                            <el-tag v-else-if="scope.row.approvalState == 2">已通过</el-tag>
                            <el-tag type="danger" v-else-if="scope.row.approvalState == 3">已驳回</el-tag>
                            <el-tag type="success" v-else>已调整</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="审批日期" width="150">
                        <template v-slot="scope">
                            <el-tag type="warning" v-if="scope.row.approvalState == 1">暂未审批</el-tag>
                            <p v-else>{{scope.row.approvalDate | dateFormat1}}</p>
                        </template>
                    </el-table-column>
                </el-table>
            </el-dialog>
        </el-card>
    </div>
</template>
<script>
export default {
    data() {
        return {
            applyForm: {},
            tableList: [],
            dialogTableVisible: false
        }
    },
    computed: {
        listLength() {
            var nums = 0
            this.tableList.forEach(item => {
                if (item.approvalState !== 1) {
                    nums++
                }
            })
            return nums
        }
    },
    created () {
        this.getUserInfo()
        this.getSubmitList()
    },
    methods: {
        // 获取用户信息
        async getUserInfo() {
            const { data: res } = await this.$http.get('adjust/userInfo')
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.applyForm = res.data
        },
        // 获取用户调整宿舍申请单
        async getSubmitList() {
            const { data: res } = await this.$http.get('adjust/submit')
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.tableList = res.data
        },
        // 宿舍调整申请
        async applyAdjust() {
            const { data: res } = await this.$http.post('adjust/apply', this.applyForm)
            if (res.meta.status !== 201) return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
            this.$message({ type: 'success', center: true, message: '宿舍调整申请成功!', showClose: true })
            this.getUserInfo()
            this.getSubmitList()
        },
        resetForm(formName) {
            this.$refs[formName].resetFields()
            this.getUserInfo()
        }
    }
}
</script>
<style lang="less" scoped>
.btn{
    position: relative;
    left:50%;
    transform: translateX(-5%);
}
.watchbtn{
    display: inline-block;
    position: relative;
    right:-73%;
}
#title{
    font-size: 24px;
}
</style>
