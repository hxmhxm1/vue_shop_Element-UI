<template>
  <el-container class="home-content">
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <el-aside :width="iscollapse?'64px':'200px'">
        <div class="toggle-botton" @click="togglecollapse">|||</div>
        <el-menu background-color="#333744" text-color="#fff"
          active-text-color="rgb(64, 158, 255)" unique-opened
          :collapse="iscollapse" :collapse-transition="false" router
          :default-active="activePath">
          <el-submenu :index="itemx.id+''" v-for="itemx in menulist"
            :key="itemx.id">
            <template slot="title">
              <i :class="iconsObj[itemx.id]"></i>
              <span>{{itemx.authName}}</span>
            </template>
            <el-menu-item v-for="itemy in itemx.children" :key="itemy.id"
              :index="'/'+itemy.path" @click="saveNavstate('/'+itemy.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span style="padding-left:10px">{{itemy.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'home',
  data() {
    return {
      menulist: [],
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      iscollapse: false,
      activePath: ''
    };
  },
  created() {
    this.getMenulist();
    this.activePath = window.sessionStorage.getItem('activePath');
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push('/login');
    },
    async getMenulist() {
      const { data: res } = await this.$http.get('menus');
      // console.log(res);
      if (res.meta.status != 200) this.$message.error('数据无法加载');
      this.menulist = res.data;
      console.log(this.menulist);
    },
    togglecollapse() {
      this.iscollapse = !this.iscollapse;
    },
    saveNavstate(activePath) {
      window.sessionStorage.setItem('activePath', activePath);
      this.activePath = activePath;
    }
  }
};
</script>

<style lang="less" scoped>
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: aliceblue;
  padding-left: 0;
  > div {
    display: flex;
    align-items: center;
    span {
      padding-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}
.home-content {
  height: 100%;
}
.iconfont {
  margin-right: 10px;
}
.toggle-botton {
  color: white;
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  letter-spacing: 0.2rem;
  cursor: pointer;
}
</style>