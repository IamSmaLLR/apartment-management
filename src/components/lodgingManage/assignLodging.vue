<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>住宿管理</el-breadcrumb-item>
            <el-breadcrumb-item>分配宿舍</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- alert警示区域 -->
            <el-alert title="注意：只可以分配未分配学生，调整更换宿舍请先审批" type="warning" show-icon></el-alert>
            <!-- 参数标签页区域 -->
            <el-tabs v-model="activeName">
                <!-- 分配宿舍页 -->
                <el-tab-pane label="分配宿舍" name="assign">
                   <el-alert title="尚未分配宿舍的学生" type="info" show-icon style="margin-bottom:20px"></el-alert>
                    <el-row :gutter="20">
                        <el-col :span="8">
                            <el-input placeholder="请输入学号搜索" v-model="queryAssignInfo.query" clearable @clear="getAssignedList">
                                <el-button slot="append" icon="el-icon-search" @click="getAssignedList"></el-button>
                            </el-input>
                        </el-col>
                        <el-col :span="4">
                            <el-select v-model="queryAssignInfo.sex" placeholder="性别" clearable>
                                <el-option v-for="item in sex" :key="item.value" :label="item.label" :value="item.value"></el-option>
                            </el-select>
                        </el-col>
                        <el-col :span="4">
                            <el-button type="primary" @click="getAssignedList">筛选</el-button>
                        </el-col>
                    </el-row>
                    <el-table :data="assignList" stripe style="width: 100%" border>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column prop="userid" label="学号"></el-table-column>
                        <el-table-column prop="username" label="姓名"></el-table-column>
                        <el-table-column label="性别">
                            <template v-slot="scope">
                                <p v-if="scope.row.sex == 1">男</p>
                                <p v-else>女</p>
                            </template>
                        </el-table-column>
                        <el-table-column prop="collegeMajor" label="学院/专业" width="300"></el-table-column>
                        <el-table-column label="操作" width="100">
                            <template v-slot="scope">
                                <!-- 分配按钮 -->
                                <el-button type="primary" icon="el-icon-school" size="mini" @click="showAssignDialog(scope.row.userid)">分配</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-pagination
                    @size-change="handleSizeChange1"
                    @current-change="handleCurrentChange1"
                    :current-page="queryAssignInfo.pagenum"
                    :page-sizes="[1, 2, 5, 10]"
                    :page-size="queryAssignInfo.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total1">
                    </el-pagination>
                </el-tab-pane>
                <!-- 调整宿舍页 -->
                <el-tab-pane label="调整宿舍" name="adjust">
                    <el-alert title="尚未处理的审核通过需调整宿舍的学生" type="info" show-icon style="margin-bottom:20px"></el-alert>
                    <el-row :gutter="20">
                        <el-col :span="8">
                            <el-input placeholder="请输入学号搜索" v-model="queryAdjustInfo.query" clearable @clear="getAdjustedList">
                                <el-button slot="append" icon="el-icon-search" @click="getAdjustedList"></el-button>
                            </el-input>
                        </el-col>
                        <el-col :span="4">
                            <el-select v-model="queryAdjustInfo.sex" placeholder="性别" clearable>
                                <el-option v-for="item in sex" :key="item.value" :label="item.label" :value="item.value"></el-option>
                            </el-select>
                        </el-col>
                        <el-col :span="4">
                            <el-button type="primary" @click="getAdjustedList">筛选</el-button>
                        </el-col>
                    </el-row>
                    <el-table :data="adjustList" stripe style="width: 100%" border>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column prop="userid" label="学号"></el-table-column>
                        <el-table-column prop="username" label="姓名"></el-table-column>
                        <el-table-column label="性别">
                            <template v-slot="scope">
                                <p v-if="scope.row.sex == 1">男</p>
                                <p v-else>女</p>
                            </template>
                        </el-table-column>
                        <el-table-column prop="buildingId" label="楼栋号"></el-table-column>
                        <el-table-column prop="roomId" label="宿舍号"></el-table-column>
                        <el-table-column prop="collegeMajor" label="学院/专业" width="300"></el-table-column>
                        <el-table-column label="操作" width="100">
                            <template v-slot="scope">
                                <!-- 分配按钮 -->
                                <el-button type="primary" icon="el-icon-school" size="mini" @click="showAdjustDialog(scope.row.userid,scope.row.id)">调整</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-pagination
                    @size-change="handleSizeChange2"
                    @current-change="handleCurrentChange2"
                    :current-page="queryAdjustInfo.pagenum"
                    :page-sizes="[1, 2, 5, 10]"
                    :page-size="queryAdjustInfo.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total2">
                    </el-pagination>
                </el-tab-pane>
            </el-tabs>
                <!-- 编辑参数对话框 title也可以使用计算属性来做-->
                <el-dialog
                :title="this.activeName === 'assign' ? '分配宿舍': '调整宿舍'"
                :visible.sync="updateDialogVisible"
                width="400px" @close="dialogClose('updateFormRef')">
                    <!-- 内容主题区域 -->
                    <el-form label="转入宿舍" ref="updateFormRef" :model="updateForm" :rules="formRules" label-width="90px" >
                        <el-form-item label="学号:" prop="userid">
                            <el-input prefix-icon="el-icon-user-solid" v-model="updateForm.userid" placeholder="学号" disabled clearable @clear="clearValidate('updateFormRef', 'userid')"></el-input>
                        </el-form-item>
                        <el-form-item label="姓名:" prop="username">
                            <el-input prefix-icon="el-icon-collection-tag" v-model="updateForm.username" placeholder="姓名" disabled clearable @clear="clearValidate('updateFormRef', 'username')"></el-input>
                        </el-form-item>
                        <el-form-item label="转入宿舍:" prop="dmtyId">
                            <el-cascader placeholder="目标楼栋/房间" v-model="updateForm.dmtyId" :options="roomOption" clearable style="width:100%"></el-cascader>
                        </el-form-item>
                    </el-form>
                <!-- 底部区域 -->
                <span slot="footer" class="dialog-footer">
                    <el-button @click="updateDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="assignDormitory('updateFormRef')" v-if="this.activeName === 'assign'">确 定</el-button>
                    <el-button type="primary" @click="adjustDormitory('updateFormRef')" v-else-if="this.activeName === 'adjust'">确 定</el-button>
                </span>
                </el-dialog>
        </el-card>
        <el-backtop><i class="el-icon-caret-top"></i></el-backtop>
    </div>
</template>
<script>
export default {
    data() {
        return {
            activeName: 'assign',
            queryAssignInfo: {
                query: '',
                sex: '',
                pagenum: 1,
                pagesize: 5
            },
            queryAdjustInfo: {
                query: '',
                sex: '',
                pagenum: 1,
                pagesize: 5
            },
            total1: 1,
            total2: 1,
            sex: [{ value: 0, label: '全部' }, { value: 1, label: '男' }, { value: 2, label: '女' }],
            assignList: [],
            adjustList: [],
            roomOption: [],
            updateDialogVisible: false,
            updateForm: {},
            formRules: {
                dmtyId: [
                    { required: true, message: '请选择调整宿舍', trigger: 'blur' }
                ]
            },
            selectedId: ''
        }
    },
    created () {
        this.getAssignedList()
        this.getAdjustedList()
    },
    computed: {
        buildingId() {
            return this.updateForm.dmtyId['0']
        },
        roomId() {
            return this.updateForm.dmtyId['1']
        }
    },
    methods: {
        async getAssignedList() {
            const { data: res } = await this.$http.get('assign', { params: this.queryAssignInfo })
            if (res.meta.status !== 200) return this.$message.error('获取未分配学生信息失败')
            this.assignList = res.data.users
            this.total1 = res.data.total
        },
        async getAdjustedList() {
            const { data: res } = await this.$http.get('adjust', { params: this.queryAdjustInfo })
            if (res.meta.status !== 200) return this.$message.error('获取审批通过申请调整学生信息失败')
            this.adjustList = res.data.users
            this.total2 = res.data.total
        },
        // 监听pagesize改变的事件
        handleSizeChange1(newSize) {
            this.queryAssignInfo.pagesize = newSize
            this.getAssignedList()
        },
        // 监听页码值current-page改变的事件
        handleCurrentChange1(newPage) {
            this.queryAssignInfo.pagenum = newPage
            this.getAssignedList()
        },
        // 监听pagesize改变的事件
        handleSizeChange2(newSize) {
            this.queryAdjustInfo.pagesize = newSize
            this.getAdjustedList()
        },
        // 监听页码值current-page改变的事件
        handleCurrentChange2(newPage) {
            this.queryAdjustInfo.pagenum = newPage
            this.getAdjustedList()
        },
        // 分配宿舍对话框
        async showAssignDialog(userid) {
            const { data: res1 } = await this.$http.get('assign/' + userid)
            if (res1.meta.status !== 200) return this.$message.error('查询学生信息失败！')
            const { data: res2 } = await this.$http.get('dormitory/cascader/info')
            if (res2.meta.status !== 200) return this.$message.error('查询楼栋宿舍失败！')
            this.updateForm = res1.data
            this.roomOption = res2.data
            this.updateDialogVisible = true
        },
        // 调整宿舍对话框
        async showAdjustDialog(userid, id) {
            const { data: res1 } = await this.$http.get('assign/' + userid)
            if (res1.meta.status !== 200) return this.$message.error('查询学生信息失败！')
            const { data: res2 } = await this.$http.get('dormitory/cascader/info')
            if (res2.meta.status !== 200) return this.$message.error('查询楼栋宿舍失败！')
            this.updateForm = res1.data
            this.roomOption = res2.data
            this.selectedId = id
            this.updateDialogVisible = true
        },
        // 分配宿舍
        assignDormitory(formName) {
            this.$refs[formName].validate(async valid => {
                if (valid) {
                    const { data: res } = await this.$http.put('assign/' + this.updateForm.userid,
                    {
                        username: this.updateForm.username,
                        sex: this.updateForm.sex,
                        buildingId: this.buildingId,
                        roomId: this.roomId
                    })
                    if (res.meta.status !== 200) return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
                    this.$message({ type: 'success', center: true, message: '为' + this.updateForm.username + '分配宿舍成功!', showClose: true })
                    this.updateDialogVisible = false
                    this.getAssignedList()
                } else {
                    alert('验证不通过,失败!!')
                    return false
                }
            })
        },
        // 调整宿舍
        adjustDormitory(formName) {
            this.$refs[formName].validate(async valid => {
                if (valid) {
                    const { data: res } = await this.$http.put('adjust/' + this.updateForm.userid + '/' + this.selectedId,
                    {
                        username: this.updateForm.username,
                        sex: this.updateForm.sex,
                        buildingId: this.buildingId,
                        roomId: this.roomId
                    })
                    if (res.meta.status !== 200) return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
                    this.$message({ type: 'success', center: true, message: '为' + this.updateForm.username + '调整宿舍成功!', showClose: true })
                    this.updateDialogVisible = false
                    this.getAdjustedList()
                } else {
                    alert('验证不通过,失败!!')
                    return false
                }
            })
        },
        // 监听添加用户对话框的关闭事件
        dialogClose(formName) {
            // 关闭对话框后重置对话框
            this.$refs[formName].resetFields()
        },
        // 监听清除表单项验证规则重置单个对话框
        clearValidate(formName, formItemName) {
            this.$refs[formName].clearValidate(formItemName)
        }
    }
}
</script>
<style lang="less" scoped>
</style>
