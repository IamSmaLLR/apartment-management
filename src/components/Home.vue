<template>
        <el-container class="home-container">
            <!-- 头部区域 -->
            <el-header>
                <div>
                    <img src="../assets/宿舍.png" alt="" style="width:45px;height:50px;margin-left:10px;">
                    <span>学生宿舍管理系统</span>
                </div>
                <el-dropdown>
                    <el-avatar :src="userAvatar" size="medium"></el-avatar>
                    <span class="el-dropdown-link" style="color:#fff;font-size:14px">
                        Welcome
                        <i class="el-icon-arrow-down el-icon--right"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <!-- 如果使用router-link标签，加上@click事件，绑定的事件会无效因为：
                        router-link的作用是单纯的路由跳转，会阻止click事件，只用click不用native,事件是不会触发的。 -->
                        <el-dropdown-item icon="el-icon-unlock" @click.native="showUpdateDialog()"> 修改密码</el-dropdown-item>
                        <el-dropdown-item icon="el-icon-switch-button" @click.native="logout()"> 退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </el-header>
            <!-- 页面主体区域 -->
            <el-container>
            <!-- 侧边栏 -->
            <!-- 当折叠起来，isCollapse为true时候为64，否则为200 -->
                <el-aside :width="isCollapse ? '64px' : '200px'">
                    <div class="toggle-button" @click="toggleCollapse()">
                        |||
                    </div>
                    <el-menu background-color="#333744" text-color="#fff" active-text-color="#4090ff"
                    unique-opened :collapse="isCollapse" :collapse-transition="false" :router="true" :default-active="activePath">
                        <!-- 一级菜单 -->
                        <!-- 为每个一级菜单提供唯一的index值，因为index只接收字符串，而item.id是一个值，所以拼接空字符串转为字符串 -->
                        <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
                            <!-- 一级菜单模板区域 -->
                            <template slot="title">
                                <!-- 图标 动态绑定图标用对象进行-->
                            <i :class="iconsObj[item.id]"></i>
                            <!-- 文本 -->
                            <span>{{item.authName}}</span>
                            </template>
                            <!-- 二级菜单 -->
                            <el-menu-item :index="'/' +subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveState('/' + subItem.path)">
                                <template slot="title">
                                <!-- 图标 -->
                                <i class="el-icon-menu"></i>
                                 <!-- 文本 -->
                                 <span>{{subItem.authName}}</span>
                                </template>
                            </el-menu-item>
                        </el-submenu>
                    </el-menu>
                </el-aside>
            <!-- 右槽内容主题 -->
                <el-main>
                    <router-view> </router-view>
                        <el-dialog
                        title="修改密码"
                        :visible.sync="updatePwdVisible"
                        width="500px"
                        @close="dialogClose('UpdatePwdFormRef')">
                        <!-- 内容主题区域 -->
                        <el-form ref="UpdatePwdFormRef" :model="UpdatePwdForm" :rules="formRules" label-width="90px" >
                            <!-- 新密码 -->
                            <el-form-item label="新密码:" prop="newPwd">
                                <el-input v-model="UpdatePwdForm.newPwd" type="password" placeholder="新密码" clearable show-password @clear="clearValidate('UpdatePwdFormRef', 'newPwd')"></el-input>
                            </el-form-item>
                            <!-- 确认密码 -->
                            <el-form-item label="确认密码:" prop="confirmPwd">
                                <el-input  v-model="UpdatePwdForm.confirmPwd" type="password" placeholder="确认密码" clearable show-password @clear="clearValidate('UpdatePwdFormRef', 'confirmPwd')"></el-input>
                            </el-form-item>
                            <el-form-item label="验证码:" prop="code">
                                <el-input prefix-icon="el-icon-key" v-model="UpdatePwdForm.code" placeholder="邮箱验证码" clearable @clear="clearValidate('UpdatePwdFormRef', 'code')" style="width:60%"></el-input>
                                <el-button type="primary" style="margin-left:8px" ref="btn" @click="getEmailCode()" :disabled="disabled">{{btnVal}}</el-button>
                            </el-form-item>
                        </el-form>
                        <span slot="footer" class="dialog-footer">
                            <el-button @click="updatePwdVisible = false">取 消</el-button>
                            <el-button type="primary" @click="updatePassword('UpdatePwdFormRef')">确 定</el-button>
                        </span>
                        </el-dialog>
                </el-main>
            </el-container>
        </el-container>
</template>

<script>
export default {
    data () {
        // 验证确认密码的校验规则
        var checkConfirm = (UpdatePwdForm, value, callback) => {
            if (value === this.UpdatePwdForm.newPwd) callback()
            else callback(new Error('确认密码与新密码不一致'))
        }
        return {
            userAvatar: '',
            menuList: [],
            iconsObj: {
                1: 'el-icon-user-solid',
                2: 'el-icon-office-building',
                3: 'el-icon-school',
                4: 'el-icon-house',
                5: 'el-icon-brush',
                6: 'el-icon-magic-stick',
                7: 'el-icon-takeaway-box',
                8: 'el-icon-s-data'
            },
            // 导航栏是否折叠
            isCollapse: false,
            // 被激活的链接的地址
            activePath: '',
            // 修改密码对话框
            updatePwdVisible: false,
            UpdatePwdForm: {
                newPwd: '',
                confirmPwd: '',
                code: ''
            },
            // 添加修改密码表单规则
            formRules: {
                // 验证新密码是否合法
                newPwd: [
                    { required: true, message: '请输入新密码', trigger: 'blur' },
                    { min: 6, max: 12, message: '密码长度在6到15个字符', trigger: 'blur' }
                ],
                // 验证确认密码是否合法
                confirmPwd: [
                    { required: true, message: '请输入确认密码', trigger: 'blur' },
                    { min: 6, max: 12, message: '密码长度在6到15个字符', trigger: 'blur' },
                    { validator: checkConfirm, trigger: 'blur' }
                ],
                code: [
                    { required: true, message: '请输入验证码', trigger: 'blur' }
                ]
            },
            btnVal: '点击获取验证码',
            timer: null,
            count: '',
            disabled: false
        }
    },
    // 在页面刚开始加载时就应该获取左侧菜单项，定义一个生命周期函数
    created () {
        this.getUserAvatar()
        this.getMenuList()
        this.activePath = window.sessionStorage.getItem('activePath')
    },
    methods: {
        async getUserAvatar() {
            const { data: res } = await this.$http.get('home')
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.userAvatar = res.data[1].avatar
        },
        logout () {
            window.sessionStorage.clear()
            this.$message({ type: 'success', center: true, message: '注销成功!', showClose: true })
            this.$router.push('/login')
        },
        // 获取所有菜单
        async getMenuList() {
            // get返回的是promise对象，所以用async/await来简化操作
            const { data: res } = await this.$http.get('menus')
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.menuList = res.data
        },
        async getEmailCode() {
            const TIME_COUNT = 60
            if (!this.timer) {
                this.count = TIME_COUNT
                this.disabled = true
                this.timer = setInterval(() => {
                    if (this.count > 0 && this.count <= TIME_COUNT) {
                        this.count--
                        this.btnVal = this.count + 's后重新获取'
                    } else {
                        this.disabled = false
                        clearInterval(this.timer)
                        this.timer = null
                        this.btnVal = '重新获取验证码'
                    }
                }, 1000)
            }
            const { data: res } = await this.$http.get('code/post2')
            if (res.meta.status !== 200) {
                this.disabled = false
                clearInterval(this.timer)
                this.timer = null
                this.btnVal = '点击获取验证码'
                this.updatePwdVisible = false
                return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
            }
        },
        updatePassword(formName) {
            this.$refs[formName].validate(async valid => {
                if (valid) {
                    const { data: res } = await this.$http.put('home/updatepwd', this.UpdatePwdForm)
                    if (res.meta.status !== 200) return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
                    this.$message({ type: 'success', center: true, message: '修改成功!请重新登录~', showClose: true })
                    this.updatePwdVisible = false
                    window.sessionStorage.clear()
                    this.$router.push('/login')
                } else {
                    alert('密码输入不符合规则!!')
                    return false
                }
            })
        },
        // 点击按钮，切换菜单的折叠和展开
        toggleCollapse() {
            this.isCollapse = !this.isCollapse
        },
        // 保存链接的激活状态
        saveState(activePath) {
            window.sessionStorage.setItem('activePath', activePath)
            this.activePath = activePath
        },
        showUpdateDialog() {
            this.updatePwdVisible = true
        },
        // 监听清除表单项验证规则重置单个对话框
        clearValidate(formName, formItemName) {
            this.$refs[formName].clearValidate(formItemName)
        },
        dialogClose(formName) {
            this.$refs[formName].resetFields()
        }
    }
}
</script>

<style lang="less" scoped>
.el-header
{
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    background-color:#293344;
    color:white;
    font-size: 22px;
    >div {
        display: flex;
        align-items: center;
        span
        {
            margin-left: 10px;
        }
    }
}
.el-aside
{
    background:rgb(42,54,70);
}
.el-main
{
    background-color: #eaedf1;
}
.home-container
{
    height: 100%;
}
.iconfont
{
    margin-right: 10px;
}
.el-menu
{
    border:0;
}
.toggle-button
{
    background-color: rgb(53,67,88);
    font-size: 10px;
    line-height:24px;
    color: #fff;
    text-align: center;
    letter-spacing: 0.3em;
    cursor:pointer;
}
  .el-dropdown-link {
    cursor: pointer;
    color: #409EFF;
  }
  .el-icon-arrow-down {
    font-size: 12px;
  }
</style>
