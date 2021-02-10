<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>学生列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 搜索和操作区域 -->
            <el-row :gutter="15">
                <el-col :span="5">
                    <el-input placeholder="请输入学号搜索" v-model="queryInfo.query" clearable @clear="getStudentsList">
                        <el-button slot="append" icon="el-icon-search" @click="getStudentsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="2">
                    <el-select v-model="queryInfo.sex" placeholder="性别" clearable @clear="getStudentsList">
                        <el-option v-for="item in sex" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                </el-col>
                <el-col :span="4">
                      <el-cascader placeholder="楼栋/房间" v-model="queryInfo.dmtyId" :options="roomOption" :props="{ checkStrictly: true }" clearable></el-cascader>
                </el-col>
                <el-col :span="3">
                    <el-select v-model="queryInfo.state" placeholder="状态" clearable @clear="getStudentsList">
                        <el-option v-for="item in state" :key="item.value" :label="item.label" :value="item.value"></el-option>
                    </el-select>
                </el-col>
                    <el-button type="primary" @click="getStudentsList">搜索</el-button>
                    <el-button type="danger" class="optbtn" @click="deleteStus()">批量删除</el-button>
                    <el-button type="warning" class="optbtn" @click="importDialogVisible = true">批量导入</el-button>
                    <el-button type="primary" class="optbtn" @click="addDialogVisible = true">新增学生</el-button>
            </el-row>
            <!-- 多选表格区域 -->
            <el-table
                ref="multipleTable"
                :data="studentsList"
                tooltip-effect="dark"
                style="width: 100%"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column prop="userid" label="学号" ></el-table-column>
                <el-table-column prop="username" label="姓名"></el-table-column>
                <el-table-column label="性别" >
                    <template v-slot="scope">
                        <p v-if="scope.row.sex == 1">男</p>
                        <p v-else>女</p>
                    </template>
                </el-table-column>
                <el-table-column label="楼栋号">
                    <template v-slot="scope">
                        <p v-if="scope.row.buildingId">{{scope.row.buildingId}}</p>
                        <p v-else>未分配</p>
                    </template>
                </el-table-column>
                <el-table-column prop="roomId" label="房间号">
                    <template v-slot="scope">
                        <p v-if="scope.row.roomId">{{scope.row.roomId}}</p>
                        <p v-else>未分配</p>
                    </template>
                </el-table-column>
                <el-table-column prop="collegeMajor" label="学院/专业" width="280"></el-table-column>
                <el-table-column label="入住状态" width="120">
                    <template v-slot="scope">
                        <el-switch v-model="scope.row.state" @change="stuStateChanged(scope.row)" disabled></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="190">
                    <template v-slot="scope">
                        <!-- 修改按钮 -->
                        <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showUpdateDialog(scope.row.userid)">编辑</el-button>
                        </el-tooltip>
                        <!-- 删除按钮 -->
                        <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteOneStu(scope.row.userid)">删除</el-button>
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
            <!-- 新增学生对话框 -->
            <el-dialog
            title="添加学生信息"
            :visible.sync="addDialogVisible"
            width="50%" @close="dialogClose('addFormRef')">
                <!-- 内容主题区域 -->
                <el-form ref="addFormRef" :model="addForm" :rules="formRules" label-width="90px" >
                    <!-- 姓名 -->
                    <el-form-item label="姓名:" prop="username">
                        <el-input prefix-icon="el-icon-user-solid" v-model="addForm.username" placeholder="姓名" clearable @clear="clearValidate('addFormRef', 'username')"></el-input>
                    </el-form-item>
                    <!-- 学号 -->
                    <el-form-item label="学号:" prop="userid">
                        <el-input prefix-icon="el-icon-collection-tag" v-model="addForm.userid" placeholder="学号" clearable @clear="clearValidate('addFormRef', 'userid')"></el-input>
                    </el-form-item>
                    <!-- 性别 -->
                    <el-form-item label="性别:" prop="sex">
                        <el-select v-model="addForm.sex" style="width:100%" clearable>
                            <el-option label="男" value="1"></el-option>
                            <el-option label="女" value="2"></el-option>
                        </el-select>
                    </el-form-item>
                    <!-- 学院/专业 -->
                    <el-form-item label="学院/专业:" prop="collegeMajor">
                        <el-cascader v-model="addForm.collegeMajor" :options="majorOption" clearable style="width:100%"></el-cascader>
                    </el-form-item>
                </el-form>
                <!-- 底部区域 -->
                <span slot="footer" class="dialog-footer">
                    <el-button @click="addDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addOneStu('addFormRef')">确 定</el-button>
                </span>
            </el-dialog>
            <!-- 编辑学生信息对话框 -->
            <el-dialog
            title="修改学生信息"
            :visible.sync="updateDialogVisible"
            width="50%" @close="dialogClose('updateFormRef')">
                <!-- 内容主题区域 -->
                <el-form ref="updateFormRef" :model="updateForm" :rules="formRules" label-width="90px" >
                    <!-- 学号 -->
                    <el-form-item label="学号:">
                        <el-input prefix-icon="el-icon-user-solid" v-model="updateForm.userid" placeholder="学号" disabled></el-input>
                    </el-form-item>
                    <!-- 姓名 -->
                    <el-form-item label="姓名:">
                        <el-input prefix-icon="el-icon-collection-tag" v-model="updateForm.username" placeholder="姓名" disabled></el-input>
                    </el-form-item>
                    <!-- 性别 -->
                    <el-form-item label="性别:" prop="sex">
                       <el-select v-model="updateForm.sex" style="width:100%" clearable>
                            <el-option label="男" value="1"></el-option>
                            <el-option label="女" value="2"></el-option>
                        </el-select>
                    </el-form-item>
                    <!-- 学院/专业 -->
                    <el-form-item label="学院/专业:" prop="collegeMajor">
                        <el-cascader v-model="updateForm.collegeMajor" :options="majorOption" clearable style="width:100%"></el-cascader>
                    </el-form-item>
                </el-form>
                 <!-- 底部区域 -->
                <span slot="footer" class="dialog-footer">
                    <el-button @click="updateDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="updateStuInfo('updateFormRef')">确 定</el-button>
                </span>
            </el-dialog>
            <!-- 批量导入信息对话框 -->
            <el-dialog
            title="批量导入学生"
            :visible.sync="importDialogVisible"
            width="400px"
            class="text-center"
            v-loading="loading"
            element-loading-text="正在解析中"
            element-loading-spinner="el-icon-loading"
            element-loading-background="rgba(0, 0, 0, 0.8)">
                <!-- 内容主题区域 -->
                <p class="tip-small" style="margin:0 0 20px 30px">
                    Tips:首次使用请先<span @click="downXlsx" class="download">下载xlsx数据模板</span>，再编辑数据
                </p>
                <el-upload
                class="upload-demo"
                drag
                :action="uploadURL"
                accept=".xlsx"
                :headers="headerObj"
                :multiple="false"
                :on-success="handleXlsxSuccess"
                :on-remove="handleXlsxRemove"
                :limit = "1"
                tips="请上传xlsx文件，切勿更改数据模板原有格式">
                <i class="el-icon-upload" style="font-size:80px"></i>
                <span class="el-upload__text">将文件拖到此处，或<em>点击上传</em></span>
                <div class="el-upload__tip" slot="tip">只能上传xlsx文件，请勿更改数据原有格式！</div>
                </el-upload>
                 <!-- 底部区域 -->
                <span slot="footer" class="dialog-footer">
                    <el-button @click="importDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="uploadXlsx()">确 定</el-button>
                </span>
            </el-dialog>
        </el-card>
        <el-backtop><i class="el-icon-caret-top"></i></el-backtop>
    </div>
</template>
<script>
import majorOption from '../../utils/collegeMajor.js'
export default {
    data() {
        return {
            // 获取学生列表的参数对象
            queryInfo: {
                query: '',
                sex: '',
                dmtyId: '',
                state: '',
                // 当前页数
                pagenum: 1,
                // 当前每一页显示多少条数据
                pagesize: 10
            },
            total: 1,
            sex: [{ value: 0, label: '全部' }, { value: 1, label: '男' }, { value: 2, label: '女' }],
            roomOption: [],
            state: [{ value: 'all', label: '全部' },
             { value: 1, label: '已入寝' },
             { value: 0, label: '未入寝' }],
            studentsList: [],
            multipleSelection: [],
            addForm: {},
            updateForm: {},
            addDialogVisible: false,
            updateDialogVisible: false,
            importDialogVisible: false,
            majorOption,
            formRules: {
                // 验证姓名是否合法
                username: [
                    { required: true, message: '请输入姓名', trigger: 'blur' },
                    { min: 2, max: 10, message: '姓名长度在2到10个字符', trigger: 'blur' }
                ],
                // 验证学号是否合法
                userid: [
                    { required: true, message: '请输入学号', trigger: 'blur' },
                    { min: 8, max: 8, message: '学号长度为8位', trigger: 'blur' }
                ],
                // 验证是否选择性别
                sex: [
                    { required: true, message: '请选择性别', trigger: 'blur' }
                ],
                // 验证是否选择专业
                collegeMajor: [
                    { required: true, message: '请选择专业', trigger: 'blur' }
                ]
            },
            uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
            // 为请求头添加authorization字段
            headerObj: { Authorization: window.sessionStorage.getItem('token') },
            // 暂时存储地址
            path: { xlsxPath: '' },
            loading: false
        }
    },
    created () {
        this.getStudentsList()
        this.getDormitory()
    },
    computed: {
        buildingId() {
            return this.queryInfo.dmtyId['0']
        },
        roomId() {
            return this.queryInfo.dmtyId['1']
        },
        collegeMajor() {
            return this.updateForm.collegeMajor['0'] + '/' + this.updateForm.collegeMajor['1']
        },
        addCollegeMajor() {
            return this.addForm.collegeMajor['0'] + '/' + this.addForm.collegeMajor['1']
        }
    },
    methods: {
        async getStudentsList() {
            const { data: res } = await this.$http.get('student',
            {
                params:
                {
                query: this.queryInfo.query,
                sex: this.queryInfo.sex,
                buildingId: this.buildingId,
                roomId: this.roomId,
                state: this.queryInfo.state,
                pagenum: this.queryInfo.pagenum,
                pagesize: this.queryInfo.pagesize
                }
            })
            if (res.meta.status !== 200) return this.$message.error('获取学生信息失败')
            this.studentsList = res.data.users
            this.total = res.data.total
        },
        async getDormitory() {
            const { data: res } = await this.$http.get('dormitory/cascader/info')
            if (res.meta.status !== 200) return this.$message.error('查询楼栋宿舍失败！')
            this.roomOption = res.data
        },
        // 监听pagesize改变的事件
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getStudentsList()
        },
        // 监听页码值current-page改变的事件
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getStudentsList()
        },
        // 处理多选表格选中的的变化
        handleSelectionChange(val) {
            this.multipleSelection = []
            for (var idx in val) {
                this.multipleSelection.push(val[idx].userid)
            }
        },
        // 添加单个学生
        addOneStu(formName) {
            this.$refs[formName].validate(async valid => {
                if (valid) {
                    const { data: res } = await this.$http.post('student/addOne', { userid: this.addForm.userid, username: this.addForm.username, sex: this.addForm.sex, collegeMajor: this.addCollegeMajor })
                    if (res.meta.status !== 201) return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
                    this.$message({ type: 'success', center: true, message: '添加学生成功!', showClose: true })
                    this.addDialogVisible = false
                    this.getStudentsList()
                } else {
                    alert('验证不通过,添加失败!!')
                    return false
                }
            })
        },
        async showUpdateDialog(id) {
            const { data: res } = await this.$http.get('student/' + id)
            if (res.meta.status !== 200) return this.$message.error('查询学生信息失败！')
            this.updateForm = res.data
            this.updateDialogVisible = true
        },
        updateStuInfo(formName) {
            this.$refs[formName].validate(async valid => {
                if (valid) {
                    const { data: res } = await this.$http.put('student/' + this.updateForm.userid, { sex: this.updateForm.sex, collegeMajor: this.collegeMajor })
                    if (res.meta.status !== 200) return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
                    this.$message({ type: 'success', center: true, message: '修改' + this.updateForm.username + '用户信息成功!', showClose: true })
                    this.updateDialogVisible = false
                    this.getStudentsList()
                } else {
                    alert('验证不通过,添加失败!!')
                    return false
                }
            })
        },
        dialogClose(formName) {
            // 关闭对话框后重置对话框
            this.$refs[formName].resetFields()
        },
        // 监听清除表单项验证规则重置单个对话框
        clearValidate(formName, formItemName) {
            this.$refs[formName].clearValidate(formItemName)
        },
        // 删除单个学生
        async deleteOneStu(id) {
            await this.$confirm('此操作将永久删除该学生信息, 不可恢复是否继续?', '提示',
            {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).then(async () => {
                const { data: res } = await this.$http.delete('student/' + id)
                if (res.meta.status !== 200) return this.$message({ type: 'error', center: true, message: '删除信息失败!', showClose: true })
                this.$message({ type: 'success', center: true, message: '删除信息成功!', showClose: true })
                this.getStudentsList()
            }).catch(() => {
                this.$message({ type: 'info', center: true, message: '已取消删除操作!', showClose: true })
            })
        },
        // 批量删除
        async deleteStus() {
            await this.$confirm('此操作将永久删除该学生信息, 不可恢复是否继续?', '提示',
            {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            })
            .then(async () => {
                const { data: res } = await this.$http.delete('student', { params: this.multipleSelection })
                if (res.meta.status !== 200) return this.$message({ type: 'error', center: true, message: '删除信息失败!', showClose: true })
                this.$message({ type: 'success', center: true, message: '删除信息成功!', showClose: true })
                this.getStudentsList()
            }).catch(() => {
                this.$message({ type: 'info', center: true, message: '已取消删除操作!', showClose: true })
            })
        },
        downXlsx() {
            const url = 'http://127.0.0.1:8888/public/assets/student-template.xlsx'
            window.open(url, '_blank')
        },
        // 上传xlsx文件的函数
        handleXlsxSuccess(res) {
            this.path.xlsxPath = res.data.tmp_path
            console.log(this.path)
            this.$message({ type: 'success', center: true, message: '添加xlsx文件成功', showClose: true })
        },
        // 解析xlsx文件
        async uploadXlsx() {
            if (this.path.xlsxPath !== '') {
                this.loading = true
                const { data: res } = await this.$http.post('student/addDuo', this.path)
                    if (res.meta.status !== 201) {
                        this.loading = false
                        return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
                    }
                this.$message({ type: 'success', center: true, message: '解析xlsx文件成功!', showClose: true })
                this.loading = false
                this.importDialogVisible = false
                this.getStudentsList()
            } else {
                this.$message({ type: 'error', center: true, message: '请先上传模板文件', showClose: true })
            }
        },
        handleXlsxRemove() {
            this.path.xlsxPath = ''
        }
    }
}
</script>
<style lang="less" scoped>
.optbtn{
    float:right;
}
.el-upload-dragger{
    padding: 0 300px!important;
}
.download{
    text-decoration: underline;
    cursor: pointer;
    color:royalblue;
}
</style>
