<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>维修管理</el-breadcrumb-item>
            <el-breadcrumb-item>报修管理</el-breadcrumb-item>
        </el-breadcrumb>
       <!-- 卡片视图区域 -->
        <el-card>
            <el-row :gutter="20">
                <el-col :span="4">
                    <el-select v-model="queryInfo.query" placeholder="审批状态" clearable @clear="getRepairList">
                        <el-option v-for="item in approvalState" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" icon="el-icon-search" @click="getRepairList">搜索</el-button>
                </el-col>
            </el-row>
            <el-table :data="approvalList" style="width: 100%" :row-class-name="tableRowClassName">
                <el-table-column type="expand">
                    <template v-slot="scope">
                        <el-form label-position="left" inline class="demo-table-expand">
                            <el-form-item label="申请原因:">
                                <div v-html="scope.row.reason"></div>
                            </el-form-item>
                        </el-form>
                    </template>
                </el-table-column>
                <el-table-column type="index" label="#" ></el-table-column>
                <el-table-column prop="userid" label="学号" ></el-table-column>
                <el-table-column prop="username" label="姓名" ></el-table-column>
                <el-table-column prop="buildingId" label="楼栋号" ></el-table-column>
                <el-table-column prop="roomId" label="宿舍号" ></el-table-column>
                <el-table-column prop="tel" label="联系方式" ></el-table-column>
                <el-table-column prop="submitDate" label="申请日期" width="180">
                    <template v-slot="scope">{{scope.row.submitDate | dateFormat1 }}</template>
                </el-table-column>
                <el-table-column label="审批状态">
                    <template v-slot="scope">
                        <el-tag type="warning" v-if="scope.row.approvalState == 1">待审批</el-tag>
                        <el-tag type="success" v-else-if="scope.row.approvalState == 2">已通过</el-tag>
                        <el-tag type="danger" v-else-if="scope.row.approvalState == 3">已驳回</el-tag>
                        <el-tag v-else>维修完成</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="160">
                    <template v-slot="scope">
                        <div v-if="scope.row.approvalState == 1">
                            <!-- 审批按钮 -->
                            <el-button type="success" size="mini" @click="changeApprovalState(scope.row.id,2)">同意</el-button>
                            <el-button type="danger" size="mini" @click="changeApprovalState(scope.row.id,3)">驳回</el-button>
                        </div>
                        <div v-else-if="scope.row.approvalState == 2">
                            <el-button type="primary" size="mini" @click="changeApprovalState(scope.row.id,4)">维修完成</el-button>
                        </div>
                        <div v-else-if="scope.row.approvalState == 3">
                            <p>已驳回维修申请</p>
                        </div>
                        <div v-else>
                            <p>维修已完成</p>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[1, 2, 5, 10]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
            </el-pagination>
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
                pagesize: 5
            },
            total: 1,
            approvalState: [{ value: 0, label: '全部' }, { value: 1, label: '待审批' }, { value: 2, label: '已通过' }, { value: 3, label: '已驳回' }, { value: 4, label: '已完成' }],
            approvalList: []
        }
    },
    created () {
        this.getRepairList()
    },
    methods: {
        tableRowClassName({ row, rowIndex }) {
            if (row.approvalState === 1) {
                return 'warning-row'
            } else if (row.approvalState === 2) {
                return 'success-row'
            } else if (row.approvalState === 3) {
                return 'danger-row'
            } else {
                return 'finish-row'
            }
        },
        async getRepairList() {
            const { data: res } = await this.$http.get('repair', { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$message.error('获取宿舍维修申请单信息失败')
            this.approvalList = res.data.repair
            this.total = res.data.total
        },
        // 监听pagesize改变的事件
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getRepairList()
        },
        // 监听页码值current-page改变的事件
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getRepairList()
        },
        async changeApprovalState(id, state) {
            const { data: res } = await this.$http.put('repair/' + id + '/' + state)
            if (res.meta.status !== 200) return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
            this.$message({ type: 'success', center: true, message: res.meta.msg, showClose: true })
            this.getRepairList()
        }
    }
}
</script>
<style lang="less" scoped>
</style>
