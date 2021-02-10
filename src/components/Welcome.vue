<template>
    <div>
            <el-row>
                <el-col :span="24">
                    <el-card style="width:100%">
                        <div>
                            <el-carousel trigger="click" height="550px">
                                <el-carousel-item v-for="item in picList" :key="item.id">
                                    <img :src="item.picPath" alt="1"/>
                                </el-carousel-item>
                            </el-carousel>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
            <el-row style="margin:10px 0px" :gutter="10">
                <el-col :span="10">
                    <!-- 个人信息卡片区域 -->
                    <el-card>
                        <div slot="header" class="clearfix">
                            <span v-if="identify == 0">欢迎您，{{username}}同学</span>
                            <span v-else>欢迎您，{{username}}管理员</span>
                            <el-button style="float: right; padding: 3px 0" type="text" @click="changeInfoVisible = true" icon="el-icon-edit">修改联系信息</el-button>
                        </div>
                        <div>
                            <img id="avatar" :src="oldimageUrl" title="点击查看大图" alt="avatar" @click="avatarDialogVisible = true">
                            <ul class="info" >
                                <li v-for="item in infoList" :key="item.id">{{item.label}}:{{item.res}}</li>
                            </ul>
                            <el-button type="primary" id="changeAvatar" round @click="changeAvatardialogVisible = true">更换头像</el-button>
                        </div>
                    </el-card>
                </el-col>
                <el-col :span="14">
                    <el-card style="padding:10px">
                        <div slot="header" class="clearfix">
                            <span>公告通知</span>
                            <el-button style="float: right; padding: 5px 0" type="text" @click="addNoticeVisible = true" icon="el-icon-edit" v-if="identify == 1">添加公告</el-button>
                        </div>
                        <el-collapse v-model="activeName" v-for="item in noticeList" :key="item.id">
                            <el-collapse-item :name="item.id + ''" style="position:relative">
                                <template slot="title">
                                <p>{{item.title}}</p>
                                <p class="header-icon el-icon-info date">{{item.date | dateFormat2}}</p>
                                </template>
                                <div>{{item.content}}
                                </div>
                                <div style="position:relative;left:470px" v-if="identify == 1">
                                    <el-button type="primary" size="small" @click="showNotice(item.id)">编辑</el-button>
                                    <el-button type="danger" size="small" @click="deleteNotice(item.id)">删除</el-button>
                                </div>
                            </el-collapse-item>
                        </el-collapse>
                        <!-- 分页区域 -->
                        <el-pagination
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                        :current-page="queryInfo.pagenum"
                        :page-sizes="[5]"
                        :page-size="queryInfo.pagesize"
                        layout="total, sizes, prev, pager, next, jumper"
                        :total="total">
                        </el-pagination>
                    </el-card>
                </el-col>
            </el-row>
            <div v-if="identify === 1" v-show="true">
                <el-row :gutter="10">
                    <el-col :span="10">
                        <el-card>
                            <div id="echarts1" style="width: 450px;height:400px;"></div>
                        </el-card>
                    </el-col>
                    <el-col :span="14">
                        <el-card>
                            <div id="echarts2" style="width: 650px;height:400px;"></div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>
            <div v-else v-show="false">
                <el-row :gutter="10">
                    <el-col :span="10">
                        <el-card>
                            <div id="echarts1" style="width: 450px;height:400px;"></div>
                        </el-card>
                    </el-col>
                    <el-col :span="14">
                        <el-card>
                            <div id="echarts2" style="width: 650px;height:400px;"></div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>
        <!-- 查看大图对话框 -->
        <el-dialog
            title="头像预览"
            :visible.sync="avatarDialogVisible"
            width="50%">
            <img :src="oldimageUrl" alt="avatar" style="width:100%">
        </el-dialog>
        <!-- 更换头像对话框 -->
        <el-dialog
        title="更换头像"
        :visible.sync="changeAvatardialogVisible"
        width="290px"
        @close="avatarDialogClose()">
        <el-upload
         class="avatar-uploader"
         :action="uploadURL"
         :show-file-list="false"
         :headers="headerObj"
         :multiple="false"
         drag
         size="100%"
         :on-success="handleAvatarSuccess"
         :before-upload="beforeAvatarUpload">
            <img v-if="newimageUrl" :src="newimageUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
            <span slot="footer" class="dialog-footer">
                <el-button @click="changeAvatardialogVisible = false">取消</el-button>
                <el-button type="primary" @click="uploadAvatar()">上传</el-button>
            </span>
        </el-dialog>
        <!-- 修改联系方式对话框 -->
        <el-dialog
            title="修改联系方式"
            :visible.sync="changeInfoVisible"
            width="500px"
            @close="dialogClose('changeInfoFormRef')">
            <!-- 内容主题区域 -->
              <el-alert title="未填写过邮箱验证码会发到新邮箱，填写过验证码会发到旧邮箱" type="info" style="margin-bottom:10px"></el-alert>
             <el-form ref="changeInfoFormRef" :model="changeInfoForm" :rules="formRules" label-width="90px" >
                <el-form-item label="电话:" prop="tel">
                    <el-input prefix-icon="el-icon-phone" v-model="changeInfoForm.tel" type="tel" placeholder="电话" clearable @clear="clearValidate('changeInfoFormRef', 'tel')"></el-input>
                </el-form-item>
                <el-form-item label="邮箱:" prop="email">
                    <el-input prefix-icon="el-icon-platform-eleme" v-model="changeInfoForm.email" type="email" placeholder="邮箱" clearable @clear="clearValidate('changeInfoFormRef', 'email')"></el-input>
                </el-form-item>
                <el-form-item label="验证码:" prop="code">
                    <el-input prefix-icon="el-icon-key" v-model="changeInfoForm.code" placeholder="邮箱验证码" clearable @clear="clearValidate('changeInfoFormRef', 'code')" style="width:60%"></el-input>
                    <el-button type="primary" style="margin-left:8px" ref="btn" @click="getEmailCode()" :disabled="disabled">{{btnVal}}</el-button>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="changeInfoVisible = false">取 消</el-button>
                <el-button type="primary" @click="changeInfo('changeInfoFormRef')">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 添加公告对话框 -->
        <el-dialog
            title="添加公告"
            :visible.sync="addNoticeVisible"
            width="50%"
            @close="dialogClose('noticeRef')">
            <!-- 内容主题区域 -->
             <el-form ref="noticeRef" :model="noticeForm" :rules="formRules" label-width="90px" >
                <!-- 旧密码 -->
                <el-form-item label="标题:" prop="title">
                    <el-input v-model="noticeForm.title" type="text" placeholder="标题" clearable @clear="clearValidate('noticeFormRef', 'title')"></el-input>
                </el-form-item>
                <!-- 新密码 -->
                <el-form-item label="内容:" prop="content">
                    <el-input v-model="noticeForm.content" type="textarea" placeholder="内容" rows="10px"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addNoticeVisible = false">取 消</el-button>
                <el-button type="primary" @click="addNotice('noticeRef')">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 编辑公告对话框 -->
        <el-dialog
            title="修改公告"
            :visible.sync="updateNoticeVisible"
            width="50%">
            <!-- 内容主题区域 -->
             <el-form ref="updateNoticeRef" :model="updateNoticeForm" :rules="formRules" label-width="90px" >
                <!-- 旧密码 -->
                <el-form-item label="标题:" prop="title">
                    <el-input v-model="updateNoticeForm.title" type="text" placeholder="标题" clearable @clear="clearValidate('updateNoticeRef', 'title')"></el-input>
                </el-form-item>
                <!-- 新密码 -->
                <el-form-item label="内容:" prop="content">
                    <el-input v-model="updateNoticeForm.content" type="textarea" placeholder="内容" rows="10px" clearable @clear="clearValidate('updateNoticeRef', 'content')"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="updateNoticeVisible = false">取 消</el-button>
                <el-button type="primary" @click="updateNotice('updateNoticeRef',selectedNoticeId)">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
import * as echarts from 'echarts'
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
            queryInfo: {
                // 当前页数
                pagenum: 1,
                // 当前每一页显示多少条数据
                pagesize: 5
            },
            total: 0,
            identify: '',
            username: '',
            infoList: [],
            avatarDialogVisible: false,
            changeAvatardialogVisible: false,
            changeInfoVisible: false,
            addNoticeVisible: false,
            updateNoticeVisible: false,
            changeInfoForm: {
                tel: '',
                email: '',
                code: ''
            },
            // 旧头像的地址
            oldimageUrl: '',
            // 新头像的地址
            newimageUrl: '',
            // 添加用户验证表单规则
            formRules: {
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator: checkEmail, trigger: 'blur' }
                    ],
                tel: [
                    { required: true, message: '请输入电话号码', trigger: 'blur' },
                    { validator: checkMobile, trigger: 'blur' }
                    ],
                title: [
                    { required: true, message: '请输入标题', trigger: 'blur' }
                    ],
                content: [
                    { required: true, message: '请输入内容', trigger: 'blur' }
                    ],
                code: [
                    { required: true, message: '请输入验证码', trigger: 'blur' }
                    ]
                },
            activeName: '',
            noticeList: [],
            noticeForm: {},
            picList: [],
            updateNoticeForm: {},
            selectedNoticeId: 0,
            uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
            // 为请求头添加authorization字段
            headerObj: { Authorization: window.sessionStorage.getItem('token') },
            // 暂时存储地址
            picPath: { avatarPath: '' },
            options1: {
                title: { text: '男女比例' },
                series: [{
                    name: '男女比例',
                    type: 'pie',
                    radius: '55%',
                    data: []
                }]
            },
            options2: {
                title: { text: '待处理事务数量' },
                tooltip: {},
                legend: { data: ['数量'] },
                xAxis: { data: ['未调整学生', '未分配学生', '未完成维修单', '未完成缴费单', '未完成租赁单'] },
                yAxis: {},
                series: [{
                    name: '数量',
                    type: 'bar',
                    data: []
                }]
            },
            btnVal: '点击获取验证码',
            timer: null,
            count: '',
            disabled: false
        }
    },
    created() {
        this.getUserInfo()
        this.getNoticeList()
        this.getPicPath()
    },
    async mounted() {
        this.drawSexProp()
        this.drawPendingPractice()
    },
    methods: {
        // 获取轮播图地址
        async getPicPath() {
            const { data: res } = await this.$http.get('home/picPath')
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.picList = res.data
        },
        // 获取用户信息
        async getUserInfo() {
            const { data: res } = await this.$http.get('home')
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.infoList = res.data[0]
            this.oldimageUrl = res.data[1].avatar
            this.identify = res.data[2].isAdmin
            this.username = res.data[0][0].res
            this.changeInfoForm.tel = res.data[0][3].res
            this.changeInfoForm.email = res.data[0][4].res
        },
        // 获取公告列表
        async getNoticeList() {
            const { data: res } = await this.$http.get('home/notice', { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.noticeList = res.data.notices
            this.total = res.data.total
        },
        // 监听pagesize改变的事件
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getNoticeList()
        },
        // 监听页码值current-page改变的事件
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getNoticeList()
        },
        // 添加公告
        addNotice(formName) {
            this.$refs[formName].validate(async valid => {
                if (valid) {
                const { data: res } = await this.$http.post('home/notice', this.noticeForm)
                if (res.meta.status !== 201) return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
                this.$message({ type: 'success', center: true, message: '添加新公告成功!', showClose: true })
                // 隐藏添加公告的对话框
                this.addNoticeVisible = false
                // 重新获取公告列表数据
                this.getNoticeList()
                } else {
                    alert('验证不通过,添加失败!!')
                    return false
                }
            })
        },
        // 展示公告信息
        async showNotice(id) {
            const { data: res } = await this.$http.get('home/notice/' + id)
            if (res.meta.status !== 200) return this.$message.error('查询公告信息失败！')
            this.updateNoticeForm = res.data
            this.selectedNoticeId = id
            this.updateNoticeVisible = true
        },
        updateNotice(formName, id) {
            this.$refs[formName].validate(async valid => {
                if (valid) {
                    const { data: res } = await this.$http.put('home/notice/' + id, this.updateNoticeForm)
                    if (res.meta.status !== 200) return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
                    this.$message({ type: 'success', center: true, message: '修改公告成功!', showClose: true })
                    this.updateNoticeVisible = false
                    this.getNoticeList()
                } else {
                    alert('验证不通过,添加失败!!')
                    return false
                }
            })
        },
        // 删除公告信息
        async deleteNotice(id) {
            await this.$confirm('此操作将永久删除该公告, 是否继续?', '提示',
            {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).then(async () => {
                const { data: res } = await this.$http.delete('home/notice/' + id)
                if (res.meta.status !== 200) return this.$message({ type: 'error', center: true, message: '删除信息失败!', showClose: true })
                this.$message({ type: 'success', center: true, message: '删除信息成功!', showClose: true })
                this.getNoticeList()
            }).catch(() => {
                this.$message({ type: 'info', center: true, message: '已取消删除操作!', showClose: true })
            })
        },
        changeInfo(formName) {
            this.$refs[formName].validate(async valid => {
                if (valid) {
                    const { data: res } = await this.$http.put('home/updatecontactinfo', this.changeInfoForm)
                    if (res.meta.status !== 200) return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
                    this.$message({ type: 'success', center: true, message: '修改成功!', showClose: true })
                    this.changeInfoVisible = false
                    this.getUserInfo()
                } else {
                    alert('信息输入不符合规则!!')
                    return false
                }
            })
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
            await this.$http.post('code/post1', this.changeInfoForm)
        },
        // 更换头像的逻辑
        handleAvatarSuccess(res) {
            this.newimageUrl = res.data.url
            this.picPath.avatarPath = res.data.tmp_path
            this.$message({ type: 'success', center: true, message: '添加头像成功', showClose: true })
        },
        beforeAvatarUpload(file) {
            const picFormat = ['image/jpeg', 'image/jpg', 'image/png']
            const isConform = picFormat.includes(file.type)
            const isLt2M = file.size / 1024 / 1024 < 2
            if (!isConform) {
            this.$message.error('上传头像图片只能是 jpg/jpeg/png 格式!')
            }
            if (!isLt2M) {
            this.$message.error('上传头像图片大小不能超过 2MB!')
            }
            return isConform && isLt2M
        },
        async uploadAvatar() {
            const { data: res } = await this.$http.put('upload/avatar', this.picPath)
            if (res.meta.status !== 200) return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
            this.$message({ type: 'success', center: true, message: '修改头像成功!', showClose: true })
            this.changeAvatardialogVisible = false
            location.reload()
        },
        avatarDialogClose() {
            this.newimageUrl = ''
            this.picPath.avatarPath = ''
        },
        // 监听清除表单项验证规则重置单个对话框
        clearValidate(formName, formItemName) {
            this.$refs[formName].clearValidate(formItemName)
        },
        dialogClose(formName) {
            this.$refs[formName].resetFields()
        },
        async drawSexProp() {
            // 基于准备好的dom，初始化echarts实例
            var myChart = echarts.init(document.getElementById('echarts1'))
            // 准备数据和配置项
            const { data: res1 } = await this.$http.get('reports/users/1')
            if (res1.meta.status !== 200) return this.$message.error('获取男同学的数量失败')
            this.options1.series[0].data.push({ value: res1.data, name: '男生数量' })
            const { data: res2 } = await this.$http.get('reports/users/2')
            if (res2.meta.status !== 200) return this.$message.error('获取女同学的数量失败')
            this.options1.series[0].data.push({ value: res2.data, name: '女生数量' })
            // 展示数据
            myChart.setOption(this.options1)
        },
        async drawPendingPractice() {
            // 基于准备好的dom，初始化echarts实例
            var myChart = echarts.init(document.getElementById('echarts2'))
            // 准备数据和配置项
            const { data: res1 } = await this.$http.get('reports/adjust')
            if (res1.meta.status !== 200) return this.$message.error('获取未调整数量失败')
            this.options2.series[0].data.push(res1.data)
            const { data: res2 } = await this.$http.get('reports/assign')
            if (res2.meta.status !== 200) return this.$message.error('获取未分配的数量失败')
            this.options2.series[0].data.push(res2.data)
            const { data: res3 } = await this.$http.get('reports/repair')
            if (res3.meta.status !== 200) return this.$message.error('获取维修的数量失败')
            this.options2.series[0].data.push(res3.data)
            const { data: res4 } = await this.$http.get('reports/pay')
            if (res4.meta.status !== 200) return this.$message.error('获取电费订单的数量失败')
            this.options2.series[0].data.push(res4.data)
            const { data: res5 } = await this.$http.get('reports/rent')
            if (res3.meta.status !== 200) return this.$message.error('获取租赁订单的数量失败')
            this.options2.series[0].data.push(res5.data)
            // 展示数据
            myChart.setOption(this.options2)
        }
    }
    }
</script>

<style lang="less" scoped>
  .text {
    font-size: 14px;
  }

  .item {
    margin-bottom: 18px;
  }

  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }
  #avatar{
      width: 140px;
      height: 140px;
      border-radius:50%;
      display: inline-block;
      position: relative;
      top:-120px;
      left:40px;
  }
  #changeAvatar{
      position: absolute;
      top:300px;
      left:78px;
      display: inline;
  }
  .info{
      display: inline-block;
      list-style-type:none;
      margin-left:30px;
      li{
          margin-bottom: 10px;
      }
  }
  .el-carousel__item img {
    opacity: 0.75;
    margin: 0;
    width: 100%;
    height: inherit;
    min-width: 100%;
  }
  .date{
      position: absolute;
      left:465px;
  }
</style>
