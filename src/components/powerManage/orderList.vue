<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>电费管理</el-breadcrumb-item>
            <el-breadcrumb-item>缴费订单</el-breadcrumb-item>
        </el-breadcrumb>
    <!-- 卡片视图区域 -->
     <el-card class="box-card">
        <!-- 搜索与添加框 -->
        <el-row :gutter="20">
            <el-col :span="8">
                <el-input placeholder="请输入学号查询" v-model="queryInfo.query" clearable @clear="getOrderList">
                     <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
                </el-input>
            </el-col>
        </el-row>
            <!-- 用户列表区域 -->
            <el-table :data="orderlist" stripe style="width: 100%" border>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="userid" label="学号"></el-table-column>
                <el-table-column prop="username" label="姓名"></el-table-column>
                <el-table-column prop="buildingId" label="楼栋号"></el-table-column>
                <el-table-column prop="roomId" label="宿舍号"></el-table-column>
                <el-table-column prop="payBalance" label="缴费金额"></el-table-column>
                <el-table-column prop="payDate" label="缴费日期">
                    <template v-slot="scope">{{ scope.row.payDate | dateFormat1 }}</template>
                </el-table-column>
                <el-table-column label="订单状态" width="230">
                    <template v-slot="scope">
                        <div v-if="scope.row.orderState == 1">
                            <el-button type="success" size="small" @click="updateOrderState(scope.row,2)">已到账充值</el-button>
                            <el-button type="danger" size="small" @click="updateOrderState(scope.row,3)">未到账取消</el-button>
                        </div>
                        <el-tag type="success" v-else-if="scope.row.orderState == 2">已到账缴费</el-tag>
                        <el-tag type="danger" v-else-if="scope.row.orderState == 3">取消订单</el-tag>
                    </template>
                </el-table-column>
            </el-table>
                <!-- 分页区域 -->
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
    data () {
        return {
            queryInfo: {
                query: '',
                // 当前页数
                pagenum: 1,
                // 当前每一页显示多少条数据
                pagesize: 5
            },
            orderlist: [],
            total: 1
        }
    },
    created () {
        this.getOrderList()
    },
    methods: {
        async getOrderList() {
            const { data: res } = await this.$http.get('power/order', { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$message.error('查询缴费订单失败！')
            this.orderlist = res.data.orders
            this.total = res.data.total
        },
        // 监听pagesize改变的事件
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getOrderList()
        },
        // 监听页码值current-page改变的事件
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getOrderList()
        },
        async updateOrderState(row, state) {
            const { data: res } = await this.$http.put('power/' + row.id,
            {
                buildingId: row.buildingId,
                roomId: row.roomId,
                payBalance: row.payBalance,
                orderState: state
            })
            if (res.meta.status !== 200) return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
            if (state === 2) this.$message({ type: 'success', center: true, message: '订单缴费成功!', showClose: true })
            if (state === 3) this.$message({ type: 'success', center: true, message: '取消订单成功!', showClose: true })
            this.getOrderList()
        }
    }
}
</script>

<style lang="less" scoped>
</style>
