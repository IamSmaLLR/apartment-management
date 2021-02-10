<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>维修管理</el-breadcrumb-item>
            <el-breadcrumb-item>报修申请</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <span id="title">填写设备报修单</span>
            <el-badge :value="listLength" class="item watchbtn" v-if="listLength !== 0">
                <el-button @click="dialogTableVisible = true" size="small" type="primary">查看申请单</el-button>
            </el-badge>
            <el-button @click="dialogTableVisible = true" size="small" type="primary" class="watchbtn" v-else>查看申请单</el-button>
            <el-form :model="applyForm" ref="applyForm" :rules="formRules" label-width="100px" class="demo-ruleForm" style="margin-top:10px">
                <el-form-item label="学号:" prop="userid">
                    <el-input prefix-icon="el-icon-user-solid" v-model="applyForm.userid" placeholder="学号" disabled></el-input>
                </el-form-item>
                <el-form-item label="姓名:" prop="username">
                    <el-input prefix-icon="el-icon-collection-tag" v-model="applyForm.username" placeholder="姓名" disabled></el-input>
                </el-form-item>
                <el-form-item label="楼栋/房间号:" prop="dmtyId">
                    <el-input prefix-icon="el-icon-school" v-model="applyForm.dmtyId" placeholder="宿舍号" disabled></el-input>
                </el-form-item>
                <el-form-item label="联系方式:" prop="tel">
                    <el-input prefix-icon="el-icon-mobile" v-model="applyForm.tel" placeholder="联系方式" ></el-input>
                </el-form-item>
                <el-form-item label="报修原因:" prop="reason">
                    <el-upload
                    id="upimg"
                    v-show="false"
                    class="upload-demo"
                    :action="imgUploadUrl"
                    :headers="headerObj"
                    :on-success="handleSuccess"
                    :before-upload="beforeUpload"
                    multiple>
                    <el-button size="small" type="primary">点击上传</el-button>
                    </el-upload>
                    <quill-editor v-model="applyForm.reason" :options="editorOption" ref="QuillEditor"></quill-editor>
                </el-form-item>
            </el-form>
            <div class="btn">
                <el-button type="primary" @click="applyRepair()">提 交</el-button>
                <el-button @click="resetForm('applyForm')">重 置</el-button>
            </div>
            <!-- 查看申请单对话框 -->
            <el-dialog title="已提交的设备报修申请单" :visible.sync="dialogTableVisible" width="60%">
                <el-table :data="tableList">
                    <el-table-column property="submitDate" label="申请日期" width="150">
                        <template v-slot="scope">{{scope.row.submitDate | dateFormat1 }}</template>
                    </el-table-column>
                    <el-table-column property="userid" label="学号"></el-table-column>
                    <el-table-column property="username" label="姓名"></el-table-column>
                    <el-table-column property="buildingId" label="楼栋号"></el-table-column>
                    <el-table-column property="roomId" label="宿舍号"></el-table-column>
                    <el-table-column property="tel" label="联系方式" width="100"></el-table-column>
                    <el-table-column label="审批状态">
                        <template v-slot="scope">
                            <el-tag type="warning" v-if="scope.row.approvalState == 1">待审批</el-tag>
                            <el-tag type="success" v-else-if="scope.row.approvalState == 2">已通过</el-tag>
                            <el-tag type="danger" v-else-if="scope.row.approvalState == 3">已驳回</el-tag>
                            <el-tag v-else>已完成</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="审批日期" width="140">
                        <template v-slot="scope">
                            <el-tag type="warning" v-if="scope.row.approvalState == 1">暂未审批</el-tag>
                            <p v-else>{{scope.row.approvalDate | dateFormat1 }}</p>
                        </template>
                    </el-table-column>
                </el-table>
            </el-dialog>
        </el-card>
    </div>
</template>
<script>
// 富文本编辑器工具栏配置，因为涉及到富文本编辑器以外的组件调用，所以在这里我们需要重新自定义一下富文本编辑器的工具栏
const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'], // toggled buttons
  ['blockquote', 'code-block'],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
  [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
  [{ direction: 'rtl' }], // text direction

  [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],
  ['link', 'image'],
  ['clean'] // remove formatting button
]
export default {
    data() {
        // 验证手机号的校验规则
        var checkMobile = (addFormRules, value, callback) => {
            const regMobile = /^(0|86|17951)?(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9]|17[0|1|2|3|5|6|7|8|9])\d{8}$/
            if (regMobile.test(value)) callback()
            else callback(new Error('电话号码不符合规则,请输入合法手机号'))
        }
        return {
            applyForm: {},
            roomOption: [],
            formRules: {
                tel: [
                    { required: true, message: '请填写联系方式', trigger: 'blur' },
                    { validator: checkMobile, trigger: 'blur' }
                ],
                reason: [{ required: true, message: '请填写报修原因', trigger: 'blur' }]
            },
            tableList: [],
            dialogTableVisible: false,
            // 上传图片接口地址
            imgUploadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
            headerObj: { Authorization: window.sessionStorage.getItem('token') },
            editorOption: {
                modules: {
                    toolbar: {
                        container: toolbarOptions, // 工具栏选项
                        handlers: { // 事件重写
                            image: function(value) {
                                if (value) {
                                // 调用element的图片上传组件
                                document.querySelector('#upimg button').click()
                                } else {
                                    this.quill.format('image', false)
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    computed: {
        listLength() {
            return this.tableList.length
        }
    },
    created () {
        this.getUserInfo()
        this.getSubmitList()
    },
    methods: {
        // 获取用户信息
        async getUserInfo() {
            const { data: res } = await this.$http.get('repair/userInfo')
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.applyForm = res.data
        },
       // 获取用户调整宿舍申请单
        async getSubmitList() {
            const { data: res } = await this.$http.get('repair/submit')
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.tableList = res.data
        },
        handleSuccess(res) {
            // 获取富文本组件实例
            const quill = this.$refs.QuillEditor.quill
            if (res) { // 如果上传成功
                // 获取光标所在位置
                const length = quill.getSelection().index
                // 插入图片，res为服务器返回的图片链接地址
                quill.insertEmbed(length, 'image', res.data.url)
                // 调整光标到最后
                quill.setSelection(length + 1)
                this.$message({ type: 'success', center: true, message: '上传图片成功', showClose: true })
            } else {
                this.$message.error('图片插入失败')
            }
        },
        beforeUpload(file) {
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
        async applyRepair() {
            const { data: res } = await this.$http.post('repair/apply', this.applyForm)
            if (res.meta.status !== 201) return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
            this.$message({ type: 'success', center: true, message: '宿舍维修申请成功!', showClose: true })
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
    right: -77%;
}
#title{
    font-size: 24px;
}
</style>
