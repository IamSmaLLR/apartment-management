<template>
    <div class="login_container">
        <div class="login_box">
            <!-- logo区域 -->
            <div class="logo_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <span>学生宿舍管理系统</span>
            <span>Dormitory Management System</span>
            <!-- 表单登录区域 -->
            <!-- ref指向表单实例对象 -->
            <el-form ref="loginFormRef" :model="loginForm" :rules="rules" label-width="0px" class="login_form">
                <!-- 用户名 -->
                <el-form-item prop="userid">
                    <el-input prefix-icon="el-icon-user-solid" v-model="loginForm.userid" placeholder="用户名"></el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item prop="password">
                    <el-input prefix-icon="el-icon-lock" v-model="loginForm.password" type="password" placeholder="密码" show-password></el-input>
                </el-form-item>
                <!-- 图形验证码 -->
                <el-form-item prop="captcha">
                    <div id="captcha">
                        <el-input prefix-icon="el-icon-key" v-model="loginForm.captcha" placeholder="验证码" style="width:63%"></el-input>
                        <span v-html="captchaSvg" @click="getCaptcha()"></span>
                    </div>
                </el-form-item>
                <!-- 按钮区域 -->
                <el-form-item class="btns">
                    <el-button type="primary" @click="submitForm('loginFormRef')">登录</el-button>
                    <el-button type="info" @click="resetForm('loginFormRef')">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
    data () {
        // 验证验证码
        var checkCaptcha = (rules, value, callback) => {
            var result = window.sessionStorage.getItem('captcha')
            if (value === result.toLowerCase() || value === result.toUpperCase() || value === result) callback()
            else callback(new Error('验证码输入错误'))
        }
        return {
            // 这是登录表单的数据绑定对象
            loginForm: {
                userid: '',
                password: '',
                captcha: ''
            },
            captchaSvg: '',
            // 这是表单验证规则对象
            rules: {
                // 验证用户名是否合法
                userid: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 8, max: 8, message: '用户名长度为为8个字符', trigger: 'blur' }
                ],
                // 验证密码是否合法
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 12, message: '密码长度在6到15个字符', trigger: 'blur' }
                ],
                // 验证验证码
                captcha: [
                    { required: true, message: '请输入验证码', trigger: 'blur' },
                    { validator: checkCaptcha, trigger: 'blur' }
                ]
            }
        }
    },
    created () {
        this.getCaptcha()
    },
    methods: {
      submitForm (formName) {
        this.$refs[formName].validate(async valid => {
          if (valid) {
            const { data: res } = await this.$http.post('login', this.loginForm)
            if (res.meta.status !== 200) return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
            this.$message({ type: 'success', center: true, message: '登录成功!', showClose: true })
            // 1.登陆成功之后token（服务器生成用户的专属token），保存在客户端的sessionStorage中
            //   1.1 项目中除了登录之外的其他API接口，必须在登录之后才能访问
            //   1.2 token只应在网站打开期间生效，所以将token保存在sessionStorage中
            window.sessionStorage.setItem('token', res.data.token)
            // 2.通过编程式导航跳转到后台主页，路由地址是/home
            this.$router.push('/home')
          } else {
            alert('登录失败!!')
            return false
          }
        })
      },
      resetForm (formName) {
        this.$refs[formName].resetFields()
        this.getCaptcha()
      },
      async getCaptcha() {
          const { data: res } = await this.$http.get('captcha')
          window.sessionStorage.setItem('captcha', res.data.text)
          this.captchaSvg = res.data.data
      }
    }
}
</script>

// 支持less语法格式，scoped（vue指令） 用来控制组件样式生效区间，只在当前组件生效，去掉就在全局生效

<style lang="less" scoped>

.login_container
{
    background-image: url(https://gw.alipayobjects.com/zos/rmsportal/TVYTbAXWheQpRcWDaDMu.svg);
    height: 100%;
}

.login_box
{
    width: 450px;
    height: 300px;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    span{
        position: relative;
        left:165px;
        bottom:10px;
        display:block;
        font-size: 18px;
    }
    span:first-of-type{
        font-size: 24px;
        margin-bottom: 10px;
    }
    .logo_box
    {
        height: 110px;
        width: 110px;
        border:1px solid #eee;
        border-radius: 50%;
        padding: 10px;
        box-shadow: 0 0 10px #ddd;
        position:absolute;
        left:50%;
        transform:translate(-155%,-50%);
        background-color: #fff;
        img
        {
            height:100%;
            width:100%;
            border-radius: 50%;
            background-color:#eee;
        }
    }
}

.login_form
{
    position: absolute;
    bottom:-35px;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
}

.btns
{
    display: flex;
    justify-content: flex-end;
    margin-top:20px;
}

#captcha{
    position: relative;
    span{
        display: inline-block;
        position: absolute;
        top:0px;
        left:260px;
    }
}
</style>
