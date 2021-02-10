<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>楼栋管理</el-breadcrumb-item>
            <el-breadcrumb-item>楼栋列表</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
            <!-- 搜索和操作区域 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入楼栋号搜索" v-model="queryInfo.query" clearable @clear="getBuildingsList">
                        <el-button slot="append" icon="el-icon-search" @click="getBuildingsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" class="optbtn" @click="addDialogVisible = true">新增楼栋</el-button>
                </el-col>
            </el-row>
              <el-table :data="buildingsList" style="width: 100%" border stripe>
                <el-table-column type="expand">
                    <template slot-scope="props">
                        <el-form label-position="left" inline class="demo-table-expand">
                        <el-form-item label="楼栋管理员">
                            <span>{{ props.row.BAName }}</span>
                        </el-form-item>
                        <el-form-item label="联系方式">
                            <span>{{ props.row.BATel }}</span>
                        </el-form-item>
                        </el-form>
                    </template>
                </el-table-column>
                <el-table-column label="楼栋号" prop="buildingId" ></el-table-column>
                <el-table-column label="楼栋标识">
                    <template v-slot="scope">
                        <p v-if="scope.row.identify == 1">男生宿舍</p>
                        <p v-else>女生宿舍</p>
                    </template>
                </el-table-column>
                <el-table-column label="楼层高" prop="buildingHeight" ></el-table-column>
                <el-table-column label="房间数" prop="roomNums" ></el-table-column>
                <el-table-column label="描述" prop="buildingDesc" width="300"></el-table-column>
                <el-table-column label="操作" width="257">
                    <template v-slot="scope">
                        <!-- 修改按钮 -->
                        <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showUpdateDialog(scope.row.id)">编辑楼栋信息</el-button>
                        </el-tooltip>
                        <!-- 删除按钮 -->
                        <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteBuilding(scope.row.id)">删除楼栋</el-button>
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
            <!-- 新增楼栋对话框 -->
            <el-dialog
            title="添加楼栋信息"
            :visible.sync="addDialogVisible"
            width="50%" @close="dialogClose('addFormRef')">
                <!-- 内容主题区域 -->
                <el-form ref="addFormRef" :model="addForm" :rules="formRules" label-width="90px" >
                    <!-- 楼栋号 -->
                    <el-form-item label="楼栋号:" prop="buildingId">
                        <el-input prefix-icon="el-icon-office-building" v-model="addForm.buildingId" placeholder="楼栋号" clearable @clear="clearValidate('addFormRef', 'buildingId')"></el-input>
                    </el-form-item>
                    <!-- 楼栋标识 -->
                    <el-form-item label="楼栋标识:" prop="identify">
                       <el-select v-model="addForm.identify" style="width:100%" clearable>
                            <el-option label="男生宿舍" value="1"></el-option>
                            <el-option label="女生宿舍" value="2"></el-option>
                        </el-select>
                    </el-form-item>
                    <!-- 楼层高 -->
                    <el-form-item label="楼层高:" prop="buildingHeight">
                        <el-input-number v-model="addForm.buildingHeight" :min="6" :max="15" style="width:100%"></el-input-number>
                    </el-form-item>
                    <!-- 房间数 -->
                    <el-form-item label="房间数:" prop="roomNums">
                        <el-input-number v-model="addForm.roomNums" :min="60" :max="300" style="width:100%" :step="10"></el-input-number>
                    </el-form-item>
                    <!-- 楼栋管理员 -->
                    <el-form-item label="管理姓名:" prop="BAName">
                        <el-input prefix-icon="el-icon-s-custom" v-model="addForm.BAName" placeholder="管理员姓名" clearable @clear="clearValidate('addFormRef', 'BAName')"></el-input>
                    </el-form-item>
                    <!-- 管理员电话 -->
                    <el-form-item label="联系方式:" prop="BATel">
                        <el-input prefix-icon="el-icon-phone" type="tel" v-model="addForm.BATel" placeholder="管理员电话" clearable @clear="clearValidate('addFormRef', 'BATel')"></el-input>
                    </el-form-item>
                    <!-- 描述 -->
                    <el-form-item label="描述:" prop="buildingDesc">
                        <el-input v-model="addForm.buildingDesc" type="textarea" placeholder="描述" clearable @clear="clearValidate('addFormRef', 'buildingDesc')"></el-input>
                    </el-form-item>
                </el-form>
                <!-- 底部区域 -->
                <span slot="footer" class="dialog-footer">
                    <el-button @click="addDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addBuilding('addFormRef')">确 定</el-button>
                </span>
            </el-dialog>
            <!-- 编辑楼栋信息对话框 -->
            <el-dialog
            title="编辑楼栋信息"
            :visible.sync="updateDialogVisible"
            width="50%" @close="dialogClose('updateFormRef')">
                <!-- 内容主题区域 -->
                <el-form ref="updateFormRef" :model="updateForm" :rules="formRules" label-width="90px" >
                    <!-- 楼栋号 -->
                    <el-form-item label="楼栋号:" prop="buildingId">
                        <el-input prefix-icon="el-icon-office-building" v-model="updateForm.buildingId" placeholder="楼栋号" disabled clearable @clear="clearValidate('updateFormRef', 'buildingId')"></el-input>
                    </el-form-item>
                    <el-form-item label="楼栋标识:" prop="identify">
                       <el-select v-model="updateForm.identify" style="width:100%" clearable >
                            <el-option label="男生宿舍" value="1"></el-option>
                            <el-option label="女生宿舍" value="2"></el-option>
                        </el-select>
                    </el-form-item>
                    <!-- 楼层高 -->
                    <el-form-item label="楼层高:" prop="buildingHeight">
                        <el-input-number v-model="updateForm.buildingHeight" :min="6" :max="15" style="width:100%"></el-input-number>
                    </el-form-item>
                    <!-- 房间数 -->
                    <el-form-item label="房间数:" prop="roomNums">
                        <el-input-number v-model="updateForm.roomNums" :min="60" :max="300" style="width:100%" :step="10"></el-input-number>
                    </el-form-item>
                    <!-- 楼栋管理员 -->
                    <el-form-item label="管理姓名:" prop="BAName">
                        <el-input prefix-icon="el-icon-s-custom" v-model="updateForm.BAName" placeholder="管理员姓名" clearable @clear="clearValidate('updateFormRef', 'BAName')"></el-input>
                    </el-form-item>
                    <!-- 管理员电话 -->
                    <el-form-item label="联系方式:" prop="BATel">
                        <el-input prefix-icon="el-icon-phone" type="tel" v-model="updateForm.BATel" placeholder="管理员电话" clearable @clear="clearValidate('updateFormRef', 'BATel')"></el-input>
                    </el-form-item>
                    <!-- 描述 -->
                    <el-form-item label="描述:" prop="buildingDesc">
                        <el-input v-model="updateForm.buildingDesc" type="textarea" placeholder="描述" clearable @clear="clearValidate('updateFormRef', 'buildingDesc')"></el-input>
                    </el-form-item>
                </el-form>
                 <!-- 底部区域 -->
                <span slot="footer" class="dialog-footer">
                    <el-button @click="updateDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="updateBuildingInfo('updateFormRef')">确 定</el-button>
                </span>
            </el-dialog>
        </el-card>
        <el-backtop><i class="el-icon-caret-top"></i></el-backtop>
    </div>
</template>
<script>
export default {
    data() {
        // 验证手机号的校验规则
        var checkMobile = (addFormRules, value, callback) => {
            const regMobile = /^(0|86|17951)?(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9]|17[0|1|2|3|5|6|7|8|9])\d{8}$/
            if (regMobile.test(value)) callback()
            else callback(new Error('电话号码不符合规则,请输入合法手机号'))
        }
        return {
            // 获取楼栋列表的参数对象
            queryInfo: {
                query: '',
                // 当前页数
                pagenum: 1,
                // 当前每一页显示多少条数据
                pagesize: 5
            },
            total: 1,
            buildingsList: [],
            addDialogVisible: false,
            updateDialogVisible: false,
            addForm: {},
            updateForm: {},
            formRules: {
                BAName: [
                    { required: true, message: '请输入楼栋管理员姓名', trigger: 'blur' }
                ],
                BATel: [
                    { required: true, message: '请输入管理员电话号码', trigger: 'blur' },
                    { validator: checkMobile, trigger: 'blur' }
                ],
                buildingId: [
                    { required: true, message: '请输入楼栋号', trigger: 'blur' }
                ],
                buildingHeight: [
                    { required: true, message: '请输入楼层高度', trigger: 'blur' }
                ],
                roomNums: [
                    { required: true, message: '请输入宿舍数量', trigger: 'blur' }
                ]
            }
        }
    },
    created () {
        this.getBuildingsList()
    },
    methods: {
        async getBuildingsList() {
            const { data: res } = await this.$http.get('building', { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$message.error('获取楼栋信息失败')
            this.buildingsList = res.data.buildings
            this.total = res.data.total
        },
        // 监听pagesize改变的事件
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getBuildingsList()
        },
        // 监听页码值current-page改变的事件
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getBuildingsList()
        },
        // 添加楼栋
        addBuilding(formName) {
            this.$refs[formName].validate(async valid => {
                if (valid) {
                    const { data: res } = await this.$http.post('building', this.addForm)
                    if (res.meta.status !== 201) return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
                    this.$message({ type: 'success', center: true, message: '添加楼栋成功!', showClose: true })
                    this.addDialogVisible = false
                    this.getBuildingsList()
                } else {
                    alert('验证不通过,添加失败!!')
                    return false
                }
            })
        },
        async showUpdateDialog(id) {
            const { data: res } = await this.$http.get('building/' + id)
            if (res.meta.status !== 200) return this.$message.error('查询楼栋信息失败！')
            this.updateForm = res.data
            this.updateDialogVisible = true
        },
        updateBuildingInfo(formName) {
            this.$refs[formName].validate(async valid => {
                if (valid) {
                    const { data: res } = await this.$http.put('building/' + this.updateForm.buildingId, this.updateForm)
                    if (res.meta.status !== 200) return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
                    this.$message({ type: 'success', center: true, message: '修改' + this.updateForm.buildingId + '楼栋信息成功!', showClose: true })
                    this.updateDialogVisible = false
                    this.getBuildingsList()
                } else {
                    alert('验证不通过,添加失败!!')
                    return false
                }
            })
        },
        // 删除楼栋
        async deleteBuilding(id) {
            await this.$confirm('此操作将永久删除该楼栋信息, 不可恢复是否继续?', '提示',
            {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).then(async () => {
                const { data: res } = await this.$http.delete('building/' + id)
                if (res.meta.status !== 200) return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
                this.$message({ type: 'success', center: true, message: '删除信息成功!', showClose: true })
                this.getBuildingsList()
            }).catch(() => {
                this.$message({ type: 'info', center: true, message: '已取消删除操作!', showClose: true })
            })
        },
        dialogClose(formName) {
            // 关闭对话框后重置对话框
            this.$refs[formName].resetFields()
            this.updateForm = {}
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
