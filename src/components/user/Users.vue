<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcom' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="10">
        <el-col :span="10">
          <el-input placeholder="请输入内容" class="input-with-select"
            v-model="queryinfo.query" clearable @clear="getUserlist">
            <el-button slot="append" icon="el-icon-search" @click="getUserlist">
            </el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户
          </el-button>
        </el-col>
      </el-row>
      <el-table style="width: 100%" :data="userlist" border stripe>
        <!-- <el-table-column type="index">
        </el-table-column> -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username">
        </el-table-column>
        <el-table-column label="邮箱" prop="email">
        </el-table-column>
        <el-table-column label="电话" prop="mobile">
        </el-table-column>
        <el-table-column label="角色" prop="role_name">
        </el-table-column>
        <el-table-column label="状态">
          <!-- {{userlist}} -->
          <!-- <el-switch v-model="userlist.mg_state">
          </el-switch> -->
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"
              @click="showEditDialog(scope.row.id)">
            </el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini"
              @click="removeUserById(scope.row.id)">
            </el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top"
              :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"
                @click="setRole(scope.row)">
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange"
        @current-change="handleCurrentChange" :current-page="queryinfo.pagenum"
        :page-sizes="[1, 2, 5, 10]" :page-size="queryinfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加用户弹框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="30%"
      style="text-align:left">
      <el-form :model="adduserForm" status-icon :rules="rules" ref="addFormRef"
        label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input type="text" v-model="adduserForm.username">
          </el-input>
        </el-form-item>
        <el-form-item label="密码" prop="pass">
          <el-input type="password" v-model="adduserForm.pass">
          </el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input type="text" v-model="adduserForm.email">
          </el-input>
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input type="text" v-model="adduserForm.phone">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定
        </el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef"
        label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%"
      @close="setRoleDialogClosed">
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option v-for="item in rolesList" :key="item.id"
              :label="item.roleName" :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Users',
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;

      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb();
      }

      cb(new Error('请输入合法的邮箱'));
    };

    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;

      if (regMobile.test(value)) {
        return cb();
      }

      cb(new Error('请输入合法的手机号'));
    };

    return {
      userlist: [],
      queryinfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      value: true,
      total: 0,
      addDialogVisible: false,
      editDialogVisible: false,
      editForm: {},
      adduserinfo: {},
      adduserForm: {
        username: '',
        pass: '',
        email: '',
        phone: ''
      },
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色的数据列表
      rolesList: [],
      // 已选中的角色Id值
      selectedRoleId: '',
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在3~10个字符之间',
            trigger: 'blur'
          }
        ],
        pass: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '用户名的长度在6~15个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改表单的验证规则对象
      editFormRules: {
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    };
  },
  created() {
    this.getUserlist();
  },
  methods: {
    async getUserlist() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryinfo
      });
      if (res.meta.status != 200)
        return this.$message.error('获取用户数据失败');
      // console.log(res);
      this.total = res.data.total;
      this.userlist = res.data.users;
    },
    handleSizeChange(newSize) {
      // console.log(newSize);
      this.queryinfo.pagesize = newSize;
      this.getUserlist();
    },
    handleCurrentChange(currentSize) {
      // console.log(currentSize);
      this.queryinfo.pagenum = currentSize;
      this.getUserlist();
    },
    async userStateChange(userinfo) {
      console.log(userinfo);
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error('更新用户状态失败！');
      }
      this.$message.success('更新用户状态成功！');
    },
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        // 可以发起添加用户的网络请求
        const { data: res } = await this.$http.post('users', this.addForm);

        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败！');
        }

        this.$message.success('添加用户成功！');
        // 隐藏添加用户的对话框
        this.addDialogVisible = false;
        // 重新获取用户列表数据
        this.getUserlist();
      });
    },
    async showEditDialog(id) {
      // console.log(id);
      const { data: res } = await this.$http.get('users/' + id);
      if (res.meta.status !== 200)
        return this.$message.error('查询用户信息失败');
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    // 修改用户信息并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return;
        // 发起修改用户信息的数据请求
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        );

        if (res.meta.status !== 200) {
          return this.$message.error('更新用户信息失败！');
        }

        // 关闭对话框
        this.editDialogVisible = false;
        // 刷新数据列表
        this.getUserlist();
        // 提示修改成功
        this.$message.success('更新用户信息成功！');
      });
    },
    removeUserById(id) {
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async () => {
          console.log(id);
          const { data: res } = await this.$http.delete('users/' + id);
          if (res.meta.status !== 200) {
            return this.$message.error('删除用户失败！');
          }
          this.$message.success('删除用户成功！');
          this.getUserlist();
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
    },
    // 展示分配角色的对话框
    async setRole(userInfo) {
      this.userInfo = userInfo;
      console.log(userInfo.id);

      // 在展示对话框之前，获取所有角色的列表
      const { data: res } = await this.$http.get('roles');
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！');
      }

      this.rolesList = res.data;

      this.setRoleDialogVisible = true;
    },
    // 点击按钮，分配角色
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配的角色！');
      }

      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectedRoleId
        }
      );

      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败！');
      }

      this.$message.success('更新角色成功！');
      this.getUserlist();
      this.setRoleDialogVisible = false;
    },
    // 监听分配角色对话框的关闭事件
    setRoleDialogClosed() {
      this.selectedRoleId = '';
      this.userInfo = {};
    }
  }
};
</script>

<style lang="less" scoped>
.el-pagination {
  margin-top: 10px;
}
</style>