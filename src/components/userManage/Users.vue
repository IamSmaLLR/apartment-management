<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
    <!-- 卡片视图区域 -->
     <el-card class="box-card">
        <!-- 搜索与添加框 -->
        <el-row :gutter="20">
            <el-col :span="8">
                <el-input placeholder="请输入学号" v-model="queryInfo.query" clearable @clear="getUserList">
                     <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                </el-input>
            </el-col>
        </el-row>
            <!-- 用户列表区域 -->
            <el-table :data="userlist" stripe style="width: 100%" border>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="userid" label="学号"></el-table-column>
                <el-table-column prop="username" label="姓名"></el-table-column>
                <el-table-column prop="email" label="邮箱"></el-table-column>
                <el-table-column prop="tel" label="电话"></el-table-column>
                <el-table-column label="操作" width="180px">
                    <template v-slot="scope">
                        <!-- 修改按钮 -->
                        <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
                            <!-- showUpdateDialog(scope.row.id) -->
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showUserInfo(scope.row.userid)">编辑</el-button>
                        </el-tooltip>
                        <!-- 删除按钮 -->
                        <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(scope.row.userid)">删除</el-button>
                        </el-tooltip>
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
                <!-- 修改用户对话框 -->
                <el-dialog
                title="修改用户信息"
                :visible.sync="updateDialogVisible"
                width="50%" @close="dialogClose('updateFormRef')">
                    <!-- 内容主题区域 -->
                    <el-alert title="若不修改邮箱、电话、密码，请勿随意填写" type="info" show-icon style="margin-bottom:20px"></el-alert>
                    <el-form ref="updateFormRef" :model="updateForm" :rules="formRules" label-width="90px" >
                        <!-- 学号 -->
                        <el-form-item label="学号:">
                            <el-input prefix-icon="el-icon-user-solid" v-model="updateForm.userid" placeholder="学号" disabled></el-input>
                        </el-form-item>
                        <!-- 姓名 -->
                        <el-form-item label="姓名:">
                            <el-input prefix-icon="el-icon-collection-tag" v-model="updateForm.username" placeholder="姓名" disabled></el-input>
                        </el-form-item>
                        <!-- 邮箱 -->
                        <el-form-item label="邮箱:" prop="email">
                            <el-input prefix-icon="el-icon-eleme" v-model="updateForm.email" placeholder="邮箱" clearable @clear="clearValidate('updateFormRef', 'email')"></el-input>
                        </el-form-item>
                        <!-- 电话号码 -->
                        <el-form-item label="电话号码:" prop="tel">
                            <el-input prefix-icon="el-icon-phone" v-model="updateForm.tel" placeholder="电话号码" clearable @clear="clearValidate('updateFormRef', 'tel')"></el-input>
                        </el-form-item>
                        <!-- 密码 -->
                        <el-form-item label="密码:" prop="password">
                            <el-input prefix-icon="el-icon-lock" v-model="updateForm.password" placeholder="若不修改密码，请勿填写" clearable @clear="clearValidate('updateFormRef', 'password')"></el-input>
                        </el-form-item>
                    </el-form>
                     <!-- 底部区域 -->
                    <span slot="footer" class="dialog-footer">
                        <el-button @click="updateDialogVisible = false">取 消</el-button>
                        <el-button type="primary" @click="updateUserInfo('updateFormRef')">确 定</el-button>
                    </span>
                </el-dialog>
     </el-card>
     <el-backtop><i class="el-icon-caret-top"></i></el-backtop>
    </div>
</template>

<script>
export default {
    data () {
        // 验证邮箱的校验规则
        var checkEmail = (addFormRules, value, callback) => {
            const regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
            if (regEmail.test(value)) callback()
            else callback(new Error('邮箱不符合规则,请输入合法邮箱'))
        }
        // 验证手机号的校验规则
        var checkMobile = (addFormRules, value, callback) => {
            const regMobile = /^(0|86|17951)?(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9]|17[0|1|2|3|5|6|7|8|9])\d{8}$/
            if (regMobile.test(value)) callback()
            else callback(new Error('电话号码不符合规则,请输入合法手机号'))
        }
        return {
            // 获取用户列表的参数对象
            queryInfo: {
                query: '',
                // 当前页数
                pagenum: 1,
                // 当前每一页显示多少条数据
                pagesize: 5
            },
            // 用户列表
            userlist: [],
            total: 1,
            // 控制修改用户对话框的显示与隐藏
            updateDialogVisible: false,
            // 添加用户验证表单规则
            formRules: {
                // 验证密码是否合法
                password: [
                    { min: 6, max: 15, message: '密码长度在6到15个字符', trigger: 'blur' }
                ],
                // 验证邮箱是否合法
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator: checkEmail, trigger: 'blur' }
                ],
                // 验证电话号码是否合法
                tel: [
                    { required: true, message: '请输入电话号码', trigger: 'blur' },
                    { validator: checkMobile, trigger: 'blur' }
                ]
            },
            // 编辑数据的表单
            updateForm: {}
        }
    },
    created () {
        this.getUserList()
    },
    methods: {
        // 获取用户列表
        async getUserList() {
            const { data: res } = await this.$http.get('user', { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$message.error('获取用户信息失败')
            this.userlist = res.data.users
            this.total = res.data.total
        },
        // 监听pagesize改变的事件
        handleSizeChange(newSize) {
            // 获取用户点击按钮获得的每页多少条的最新数据赋值给queryInfo的pagesize
            this.queryInfo.pagesize = newSize
            // 重新调用getUserList()获取最新数据更新页面
            this.getUserList()
        },
        // 监听页码值current-page改变的事件
        handleCurrentChange(newPage) {
            // 用户点击后获取当前页数
            this.queryInfo.pagenum = newPage
            // 更新数据页面
            this.getUserList()
        },
        // 展示单个信息
        async showUserInfo(id) {
            const { data: res } = await this.$http.get('user/' + id)
            if (res.meta.status !== 200) return this.$message.error('查询学生信息失败！')
            this.updateForm = res.data
            this.updateDialogVisible = true
        },
        updateUserInfo(formName) {
            this.$refs[formName].validate(async valid => {
                if (valid) {
                    const { data: res } = await this.$http.put('user/' + this.updateForm.userid, { email: this.updateForm.email, tel: this.updateForm.tel, password: this.updateForm.password })
                    if (res.meta.status !== 200) return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
                    this.$message({ type: 'success', center: true, message: '修改' + this.updateForm.username + '用户信息成功!', showClose: true })
                    this.updateDialogVisible = false
                    this.getUserList()
                } else {
                    alert('验证不通过,添加失败!!')
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
        },
        // 删除用户信息
        async deleteUser(id) {
            await this.$confirm('此操作将永久删除该用户信息, 不可恢复是否继续?', '提示',
            {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).then(async () => {
                const { data: res } = await this.$http.delete('user/' + id)
                if (res.meta.status !== 200) return this.$message({ type: 'error', center: true, message: '删除用户失败!', showClose: true })
                this.$message({ type: 'success', center: true, message: '删除用户成功!', showClose: true })
                this.getUserList()
            }).catch(() => {
            this.$message({ type: 'info', center: true, message: '已取消删除操作!', showClose: true })
            })
        }
    }
}
</script>

<style lang="less" scoped>
</style>
