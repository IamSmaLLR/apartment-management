<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>租赁管理</el-breadcrumb-item>
            <el-breadcrumb-item>租赁列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图区域 -->
        <el-card class="box-card">
            <!-- 搜索与添加框 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入物品名称" v-model="queryInfo.query" clearable @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialog = true">添加租赁物品</el-button>
                </el-col>
            </el-row>
            <!-- 商品列表区域 -->
            <el-table :data="goodsList" stripe style="width: 100%" border>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="goods_name" label="物品名称"></el-table-column>
                <el-table-column prop="goods_price" label="物品租金(元/月)" width="160px"></el-table-column>
                <el-table-column prop="goods_number" label="物品数量" width="100px"></el-table-column>
                <el-table-column prop="goods_state" label="物品状态(是否开放租赁)" width="170px">
                    <template v-slot="scope">
                        <el-switch v-model="scope.row.goods_state" active-color="#13ce66" inactive-color="#ff4949" @change="goodsStateChanged(scope.row)"></el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="260px">
                    <template v-slot="scope">
                        <!-- 修改按钮 -->
                        <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="OpenUpdateDialog(scope.row.id)">编辑物品信息</el-button>
                        </el-tooltip>
                        <!-- 删除按钮 -->
                        <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteGoods(scope.row.id)">删除物品</el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!-- 分页区域 -->
                <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[5, 10, 15, 20]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
                </el-pagination>
                <!-- 编辑参数对话框 -->
                <el-dialog
                title="修改商品信息"
                :visible.sync="updateDialogVisible"
                width="50%" @close="dialogClose('updateFormRef')">
                    <!-- 内容主题区域 -->
                    <el-form ref="updateFormRef" :model="updateForm" :rules="formRules" label-width="90px" >
                        <!-- 分类名称 -->
                        <el-form-item label="物品名称:" prop="goods_name">
                            <el-input v-model="updateForm.goods_name" placeholder="物品名称" clearable @clear="clearValidate('updateFormRef', 'goods_name')"></el-input>
                        </el-form-item>
                        <el-form-item label="物品租金:" prop="goods_price">
                            <el-input-number v-model="updateForm.goods_price" :min="0" :step="10" style="width:100%"></el-input-number>
                        </el-form-item>
                        <el-form-item label="物品数量:" prop="goods_number">
                            <el-input-number v-model="updateForm.goods_number" :min="0" :max="1000" :step="5" style="width:100%"></el-input-number>
                        </el-form-item>
                    </el-form>
                     <!-- 底部区域 -->
                    <span slot="footer" class="dialog-footer">
                        <el-button @click="updateDialogVisible = false">取 消</el-button>
                        <el-button type="primary" @click="updateGoodsInfo('updateFormRef')">确 定</el-button>
                    </span>
                </el-dialog>
                <!-- 添加物品抽屉 -->
                <el-drawer
                title="添加租赁物品"
                :visible.sync="addDialog"
                direction="ltr"
                custom-class="demo-drawer"
                ref="drawer"
                size="370px"
                @close="closeDrawer()"
                >
                    <div class="demo-drawer__content">
                        <el-form ref="addFromRef" :model="addForm" label-width="90px" :rules="formRules" style="width:340px">
                            <el-form-item label="物品名称" prop="goods_name">
                                <el-input v-model="addForm.goods_name"></el-input>
                            </el-form-item>
                            <el-form-item label="物品租金:" prop="goods_price">
                                <el-input-number v-model="addForm.goods_price" :min="0" :step="10" style="width:100%"></el-input-number>
                            </el-form-item>
                            <el-form-item label="物品数量:" prop="goods_number">
                                <el-input-number v-model="addForm.goods_number" :min="1" :step="10" style="width:100%"></el-input-number>
                            </el-form-item>
                            <el-form-item label="物品描述:" prop="goods_desc">
                                <el-input v-model="addForm.goods_desc" type="textarea" rows="2" ></el-input>
                            </el-form-item>
                            <el-form-item label="物品图片:" prop="goods_picture">
                                <el-upload
                                :action="uploadURL"
                                :show-file-list="false"
                                :limit="1"
                                drag
                                :headers="headerObj"
                                :on-success="handlePictureSuccess"
                                :before-upload="beforePictureUpload"
                                class="upload">
                                <img v-if="imageUrl" :src="imageUrl" style="width:100%">
                                <i v-else class="el-icon-plus plus-icon"></i>
                                </el-upload>
                            </el-form-item>
                        </el-form>
                        <div class="demo-drawer__footer footer-box">
                            <el-button @click="addDialog = false">取 消</el-button>
                            <el-button type="primary" @click="createGoods('addFromRef')">创 建</el-button>
                        </div>
                    </div>
                </el-drawer>
     </el-card>
     <el-backtop><i class="el-icon-caret-top"></i></el-backtop>
    </div>
</template>
<script>
export default {
    data() {
        return {
            goodsList: [],
            // 获取商品列表的参数对象
            queryInfo: {
                query: '',
                // 当前页数
                pagenum: 1,
                // 当前每一页显示多少条数据
                pagesize: 10
            },
            // 获取商品记录的总数
            total: 1,
            // 控制编辑对话框的显示和隐藏
            updateDialogVisible: false,
            // 保存修改参数的数组
            updateForm: {},
            // 添加分类验证表单规则
            formRules: {
                goods_name: [{ required: true, message: '请输入物品名称', trigger: 'blur' }],
                goods_price: [{ required: true, message: '请输入物品租金', trigger: 'blur' }],
                goods_number: [{ required: true, message: '请输入物品数量', trigger: 'blur' }],
                goods_desc: [{ required: true, message: '请输入物品描述', trigger: 'blur' }],
                goods_picture: [{ required: true, message: '请添加物品图片', trigger: 'blur' }]
            },
            addDialog: false,
            addForm: {},
            imageUrl: '',
            uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
            // 为请求头添加authorization字段
            headerObj: { Authorization: window.sessionStorage.getItem('token') },
            seletedId: ''
        }
    },
    created () {
        this.getGoodsList()
    },
    methods: {
        async getGoodsList() {
            const { data: res } = await this.$http.get('rent/allGoods', { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$message.error('获取租赁物品信息失败')
            this.goodsList = res.data.goods
            this.total = res.data.total
        },
        // 监听pagesize改变的事件
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getGoodsList()
        },
        // 监听页码值current-page改变的事件
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getGoodsList()
        },
        // 上传商品图片的逻辑
        handlePictureSuccess(res) {
            this.imageUrl = res.data.url
            this.addForm.goods_picture = res.data.tmp_path
            this.$message({ type: 'success', center: true, message: '添加商品图片成功', showClose: true })
        },
        beforePictureUpload(file) {
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
        async createGoods(formName) {
            this.$refs[formName].validate(async valid => {
                if (valid) {
                    const { data: res } = await this.$http.put('upload/goods', this.addForm)
                    if (res.meta.status !== 200) return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
                    this.$message({ type: 'success', center: true, message: '创建商品成功!', showClose: true })
                    this.addDialog = false
                    this.getGoodsList()
                } else {
                    alert('验证不通过,创建失败!!')
                    return false
                }
            })
        },
        closeDrawer() {
            this.addForm = {}
        },
        async goodsStateChanged(row) {
            var state = row.goods_state === true ? 1 : 0
            const { data: res } = await this.$http.put(`rent/goods/${row.id}/${state}`)
            if (res.meta.status !== 200) {
                // 更新失败时页面的switch需要更新为原来的状态 取反
                row.goods_state = !row.goods_state
                return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
            }
            this.$message({ type: 'success', center: true, message: '更新租赁物品物品状态成功!', showClose: true })
        },
        async OpenUpdateDialog(id) {
            const { data: res } = await this.$http.get('rent/goods/' + id)
            if (res.meta.status !== 200) return this.$message.error('获取租赁物品信息失败')
            this.updateForm = res.data
            this.seletedId = id
            this.updateDialogVisible = true
        },
        updateGoodsInfo(formName) {
            this.$refs[formName].validate(async valid => {
                if (valid) {
                    const { data: res } = await this.$http.put('rent/' + this.seletedId, this.updateForm)
                    if (res.meta.status !== 200) return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
                    this.$message({ type: 'success', center: true, message: '编辑租赁物品信息成功!', showClose: true })
                    this.updateDialogVisible = false
                    this.getGoodsList()
                } else {
                    alert('验证不通过,添加失败!!')
                    return false
                }
            })
        },
        async deleteGoods(id) {
            await this.$confirm('此操作将永久删除该租赁物品信息, 不可恢复是否继续?', '提示',
            {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).then(async () => {
                const { data: res } = await this.$http.delete('rent/' + id)
                if (res.meta.status !== 200) return this.$message({ type: 'error', center: true, message: res.meta.msg, showClose: true })
                this.$message({ type: 'success', center: true, message: '删除租赁物品信息成功!', showClose: true })
                this.getGoodsList()
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
.footer-box{
    position: relative;
    left:180px;
}
</style>
