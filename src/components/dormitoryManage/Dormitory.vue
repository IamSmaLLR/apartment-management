<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>宿舍管理</el-breadcrumb-item>
            <el-breadcrumb-item>宿舍列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <!-- 搜索和操作区域 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入楼栋号搜索" v-model="queryInfo.query" clearable @clear="getDmtyList">
                        <el-button slot="append" icon="el-icon-search" @click="getDmtyList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" class="optbtn" @click="getBuildingList">新增宿舍</el-button>
                </el-col>
            </el-row>
            <!-- 树形网格表格：分类列表数据 -->
            <tree-table :data="dmtyList" :columns="columns" show-index index-text="#" :selection-type="false" :expand-type="false" border style="margin-top:20px">
                <!-- 成员模板 -->
                <template slot="dmty_members" scope="scope">
                    <el-tag v-if="!scope.row.members && scope.row.identify == 1" effect="plain" type="warning">暂无学生</el-tag>
                    <div v-else-if="scope.row.members && scope.row.identify == 1">
                        <el-tag effect="plain" type="success" v-for="(item,index) in scope.row.members" :key="index" style="margin-right:8px">{{item}}</el-tag>
                    </div>
                </template>
                <!-- 标识模板 -->
                <template slot="dmty_idt" scope="scope">
                    <el-tag v-if="scope.row.identify == 0">楼栋</el-tag>
                    <el-tag v-else type="success">宿舍</el-tag>
                </template>
                <!-- 操作模板 -->
                <template slot="dmty_opt" scope="scope">
                    <div v-if="scope.row.identify == 1">
                    <!-- 修改按钮 -->
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showUpdateDialog(scope.row.id)">编辑</el-button>
                    <!-- 删除按钮 -->
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteDormitory(scope.row.id)">删除</el-button>
                    </div>
                    <div v-else>
                        <el-tag type="info"><i class="el-icon-info"></i> 点击左侧<i class="el-icon-circle-plus-outline"></i>查看详情</el-tag>
                    </div>
                </template>
            </tree-table>
            <!-- 分页区域 -->
            <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[60, 120, 300, 600]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
            </el-pagination>
            <!-- 新增楼栋对话框 -->
            <el-dialog
            title="添加宿舍信息"
            :visible.sync="addDialogVisible"
            width="50%" @close="dialogClose('addFormRef')">
                <!-- 内容主题区域 -->
                <el-form ref="addFormRef" :model="addForm" :rules="formRules" label-width="90px" >
                    <!-- 楼栋号 -->
                    <el-form-item label="楼栋号:" prop="buildingId">
                       <el-select v-model="addForm.buildingId" style="width:100%" clearable >
                            <el-option v-for="(item,index) in buildingList" :key="index" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                    <!-- 宿舍号 -->
                    <el-form-item label="宿舍号:" prop="roomId">
                        <el-input prefix-icon="el-icon-school" v-model="addForm.roomId" placeholder="宿舍号" clearable @clear="clearValidate('addFormRef', 'roomId')"></el-input>
                    </el-form-item>
                    <!-- 容纳人数 -->
                    <el-form-item label="容纳人数:" prop="capacity">
                        <el-input-number v-model="addForm.capacity" :min="2" :max="8"  style="width:100%"></el-input-number>
                    </el-form-item>
                </el-form>
                <!-- 底部区域 -->
                <span slot="footer" class="dialog-footer">
                    <el-button @click="addDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addDormitory('addFormRef')">确 定</el-button>
                </span>
            </el-dialog>
            <!-- 编辑楼栋信息对话框 -->
            <el-dialog
            title="编辑宿舍信息"
            :visible.sync="updateDialogVisible"
            width="50%" @close="dialogClose('updateFormRef')">
                <!-- 内容主题区域 -->
                <el-form ref="updateFormRef" :model="updateForm" :rules="formRules" label-width="90px" >
                    <!-- 楼层号 -->
                    <el-form-item label="楼栋号:" prop="buildingId">
                        <el-input prefix-icon="el-icon-office-building" v-model="updateForm.buildingId" disabled placeholder="楼栋号"></el-input>
                    </el-form-item>
                    <!-- 宿舍号 -->
                    <el-form-item label="宿舍号:" prop="roomId">
                        <el-input prefix-icon="el-icon-school" v-model="updateForm.roomId" disabled placeholder="宿舍号"></el-input>
                    </el-form-item>
                    <!-- 容纳人数 -->
                    <el-form-item label="容纳人数:" prop="capacity">
                        <el-input-number v-model="updateForm.capacity" :min="2" :max="8"  style="width:100%"></el-input-number>
                    </el-form-item>
                </el-form>
                 <!-- 底部区域 -->
                <span slot="footer" class="dialog-footer">
                    <el-button @click="updateDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="updateDormitoryInfo('updateFormRef')">确 定</el-button>
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
            // 获取学生列表的参数对象
            queryInfo: {
                query: '',
                // 当前页数
                pagenum: 1,
                // 当前每一页显示多少条数据
                pagesize: 60
            },
            total: 1,
            buildingList: [],
            dmtyList: [],
            // 树形表格列配置column
            columns: [{ label: '楼栋/宿舍号', prop: 'dmtyId', width: '130px' },
                      { label: '容纳人数', prop: 'allCapacity', width: '90px' },
                      { label: '空闲人数', prop: 'idleCapacity', width: '90px' },
                      { label: '宿舍成员', prop: 'members', type: 'template', template: 'dmty_members' },
                      { label: '标识', prop: 'identify', type: 'template', template: 'dmty_idt', width: '70px' },
                      { label: '操作', type: 'template', template: 'dmty_opt', width: '181px' }],
            addDialogVisible: false,
            updateDialogVisible: false,
            addForm: {},
            updateForm: {},
            formRules: {
                buildingId: [
                    { required: true, message: '请输入楼栋号', trigger: 'blur' }
                ],
                roomId: [
                    { required: true, message: '请输入宿舍号', trigger: 'blur' }
                ],
                capacity: [
                    { required: true, message: '请输入容纳数量', trigger: 'blur' }
                ]
            }
        }
    },
    created () {
        this.getDmtyList()
    },
    methods: {
        async getDmtyList() {
            const { data: res } = await this.$http.get('dormitory', { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$message.error('获取宿舍信息失败')
            this.dmtyList = res.data.dormitory
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
        async getBuildingList() {
            const { data: res } = await this.$http.get('dormitory/building')
            if (res.meta.status !== 200) return this.$message.error('获取楼栋信息失败')
            this.buildingList = res.data
            this.addDialogVisible = true
            console.log(this.buildingList)
        },
        // 添加宿舍
        addDormitory(formName) {
            this.$refs[formName].validate(async valid => {
                if (valid) {
                    const { data: res } = await this.$http.post('dormitory', this.addForm)
                    if (res.meta.status !== 201) return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
                    this.$message({ type: 'success', center: true, message: '添加宿舍成功!', showClose: true })
                    this.addDialogVisible = false
                    this.getDmtyList()
                } else {
                    alert('验证不通过,添加失败!!')
                    return false
                }
            })
        },
        async showUpdateDialog(id) {
            const { data: res } = await this.$http.get('dormitory/' + id)
            if (res.meta.status !== 200) return this.$message.error('查询宿舍信息失败！')
            this.updateForm = res.data
            this.updateDialogVisible = true
        },
        updateDormitoryInfo(formName) {
            this.$refs[formName].validate(async valid => {
                if (valid) {
                    const { data: res } = await this.$http.put('dormitory/' + this.updateForm.id, this.updateForm)
                    if (res.meta.status !== 200) return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
                    this.$message({ type: 'success', center: true, message: '修改宿舍信息成功!', showClose: true })
                    this.updateDialogVisible = false
                    this.getDmtyList()
                } else {
                    alert('验证不通过,添加失败!!')
                    return false
                }
            })
        },
        // 删除楼栋
        async deleteDormitory(id) {
            await this.$confirm('此操作将永久删除该宿舍信息, 不可恢复是否继续?', '提示',
            {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).then(async () => {
                const { data: res } = await this.$http.delete('dormitory/' + id)
                if (res.meta.status !== 200) return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
                this.$message({ type: 'success', center: true, message: '删除信息成功!', showClose: true })
                this.getDmtyList()
            }).catch(() => {
                this.$message({ type: 'info', center: true, message: '已取消删除操作!', showClose: true })
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
