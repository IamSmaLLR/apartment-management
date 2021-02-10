<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>租赁管理</el-breadcrumb-item>
            <el-breadcrumb-item>租赁物品</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 搜索与添加框 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入物品名称" v-model="queryInfo.query" clearable @clear="getGoodsList" v-if="ApprovedListLength !== 0" style="margin-top:10px">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                    <el-input placeholder="请输入物品名称" v-model="queryInfo.query" clearable @clear="getGoodsList" v-else>
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-badge :value="ApprovedListLength" class="item" v-if="ApprovedListLength !== 0">
                        <el-button type="primary" @click="getSubmitList();rentListDialogVisible = true">查看租赁申请单</el-button>
                    </el-badge>
                    <el-button type="primary" @click="getSubmitList();rentListDialogVisible = true" v-else>查看租赁申请单</el-button>
                </el-col>
            </el-row>
                <!-- 商品列表区域 -->
                <el-table :data="goodsList" stripe style="width: 100%" border>
                    <el-table-column type="index" label="#"></el-table-column>
                    <el-table-column prop="goods_name" label="物品名称" width="300"></el-table-column>
                    <el-table-column prop="goods_price" label="物品租金(元/月)" width="108px"></el-table-column>
                    <el-table-column prop="goods_picture" label="物品图片" width="222px">
                        <template v-slot="scope">
                            <img :src="scope.row.goods_picture" alt="租赁物品图片" style="width:200px;height:200px">
                        </template>
                    </el-table-column>
                    <el-table-column prop="goods_desc" label="物品描述"></el-table-column>
                    <el-table-column label="操作" width="100px">
                        <template v-slot="scope">
                            <!-- 租赁按钮 -->
                            <el-tooltip effect="dark" content="租赁" placement="top" :enterable="false">
                                <el-button type="primary" icon="el-icon-thumb" size="mini" @click="OpenRentDialog(scope.row)">租赁</el-button>
                            </el-tooltip>
                        </template>
                    </el-table-column>
                </el-table>
                <!-- 分页区域 -->
                <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[5, 10, 15, 20]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
                </el-pagination>
            <!-- 租赁申请单对话框 -->
            <el-dialog title="已提交的电器租赁申请单" :visible.sync="rentListDialogVisible" width="70%">
                <el-table :data="rentList">
                    <el-table-column property="submitDate" label="申请日期" width="160">
                        <template v-slot="scope">{{scope.row.submitDate | dateFormat1 }}</template>
                    </el-table-column>
                    <el-table-column property="userid" label="学号" width="80"></el-table-column>
                    <el-table-column property="username" label="姓名" width="80"></el-table-column>
                    <el-table-column property="goods_name" label="物品名称" width="140"></el-table-column>
                    <el-table-column property="goods_price" label="物品租金">
                        <template v-slot="scope">{{scope.row.goods_price}}元/月</template>
                    </el-table-column>
                    <el-table-column label="租赁时长">
                        <template v-slot="scope">{{scope.row.rent_time}}个月</template>
                    </el-table-column>
                    <el-table-column label="审批状态" width="180">
                        <template v-slot="scope">
                            <el-tag type="warning" v-if="scope.row.approvalState == 1">待审批</el-tag>
                            <el-tag type="success" v-else-if="scope.row.approvalState == 2">已通过，联系管理员缴费</el-tag>
                            <el-tag type="danger" v-else-if="scope.row.approvalState == 3">已驳回，请联系管理员</el-tag>
                            <el-tag v-else>租赁完成</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="审批日期" width="160">
                        <template v-slot="scope">
                            <el-tag type="warning" v-if="scope.row.approvalState == 1">暂未审批</el-tag>
                            <p v-else>{{scope.row.approvalDate | dateFormat1 }}</p>
                        </template>
                    </el-table-column>
                </el-table>
            </el-dialog>
            <!-- 租赁对话框 -->
            <el-dialog title="租赁申请" :visible.sync="rentDialogVisible" width="400px" @close="resetForm('rentFormRef')">
                  <el-alert class="el-icon-info" title="提交申请后等待审批通过找宿管缴费租赁" type="info"></el-alert>
                    <el-form ref="rentFormRef" :model="rentForm" label-width="90px">
                        <!-- 分类名称 -->
                        <el-form-item label="物品名称:" prop="goods_name">
                            <el-input v-model="rentForm.goods_name" placeholder="物品名称" clearable disabled></el-input>
                        </el-form-item>
                        <el-form-item label="物品租金:" prop="goods_price">
                            <el-input v-model="rentForm.goods_price" placeholder="物品租金" clearable disabled></el-input>
                        </el-form-item>
                        <el-form-item label="租赁时间:" prop="rent_time">
                            <el-input-number v-model="rentForm.rent_time" :min="1" :max="12" style="width:100%"></el-input-number>
                        </el-form-item>
                    </el-form>
                     <!-- 底部区域 -->
                    <span slot="footer" class="dialog-footer">
                        <el-button @click="rentDialogVisible = false">取 消</el-button>
                        <el-button type="primary" @click="applyRent()">确 定</el-button>
                    </span>
            </el-dialog>
        </el-card>
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
            goodsList: [],
            rentListDialogVisible: false,
            rentDialogVisible: false,
            rentList: [],
            rentForm: {}
        }
    },
    computed: {
        ApprovedListLength() {
            return this.rentList.length
        }
    },
    created () {
        this.getGoodsList()
        this.getSubmitList()
    },
    methods: {
        async getGoodsList() {
            const { data: res } = await this.$http.get('rent/goods', { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$message.error('获取租赁物品信息失败')
            this.goodsList = res.data.goods
            this.total = res.data.total
        },
        // 获取用户调整宿舍申请单
        async getSubmitList() {
            const { data: res } = await this.$http.get('rent/submit')
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.rentList = res.data
        },
        OpenRentDialog(row) {
            this.rentForm.goods_name = row.goods_name
            this.rentForm.goods_price = row.goods_price
            this.rentForm.id = row.id
            this.rentDialogVisible = true
        },
        async applyRent() {
            const { data: res } = await this.$http.post('rent/apply', this.rentForm)
            if (res.meta.status !== 201) return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
            this.$message({ type: 'success', center: true, message: '物品租赁申请成功!', showClose: true })
            this.rentDialogVisible = false
            this.getGoodsList()
            this.getSubmitList()
        },
        // 监听pagesize改变的事件
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getGoodsList()
        },
        // 监听页码值current-page改变的事件
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getGoodsList()
        },
        resetForm(formName) {
            this.$refs[formName].resetFields()
        }
    }
}
</script>
<style lang="less" scoped>
.el-alert{
    margin-bottom: 15px;
}
</style>
