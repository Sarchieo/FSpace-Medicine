<template>
  <div>
    <a-layout>
      <f-space-header type="login"></f-space-header>
      <div class="login-box">
          <div class="login-input">
            <p class="user-login">用户登录</p>
            <a-form :form="form" @submit="handleSubmit">
              <a-form-item
                :label-col="formItemLayout.labelCol"
                :wrapper-col="formItemLayout.wrapperCol"
                label="用户名"
              >
                <a-input
                  v-decorator="[
                    'phone',
                    {
                      rules: [ {
                        required: true,
                        validator: validatePhone,
                      }],
                    }
                  ]"
                  placeholder="请输入用户名"
                />
              </a-form-item>
              <a-form-item
                :label-col="formItemLayout.labelCol"
                :wrapper-col="formItemLayout.wrapperCol"
                label="密码"
              >
                <a-input
                  type="password"
                  v-decorator="[
                    'password',
                    {
                      rules: [{
                        required: true,
                        validator: validatePwd,
                      }],
                    }
                  ]"
                  placeholder="请输入账号密码"
                />
              </a-form-item>
              <a-form-item
                v-if='isCaptcha'
                :label-col="formTailLayout.labelCol"
                :wrapper-col="formTailLayout.wrapperCol"
                v-bind="formItemLayout"
                label="验证码"
              >
                <a-row :gutter="8">
                  <a-col :span="12">
                    <a-input
                      v-decorator="[
                        'verification',
                        {rules: [{ required: isCaptcha, message: '请输入验证码' }]}
                      ]"
                    />
                  </a-col>
                  <a-col :span="12">
                    <img :src="captchaURL" @click='getCaptcha'>
                  </a-col>
                </a-row>
              </a-form-item>
              <a-form-item
                :label-col="formTailLayout.labelCol"
                :wrapper-col="formTailLayout.wrapperCol"
              >
                <a-button :loading="loading" class="login-btn" html-type="submit">登录</a-button>
              </a-form-item>
            </a-form>
            <p class="to-register"> <span class="forget" @click="toForget()">忘记密码</span> <span class="register">还没有账号？立即去
              <nuxt-link to="/user/register">注册</nuxt-link></span>
            </p>
          </div>
      </div>
      <f-space-footer></f-space-footer>
    </a-layout>
  </div>
</template>
<script>
import FSpaceHeader from "../../components/fspace-ui/header/header";
import FSpaceFooter from "../../components/fspace-ui/footer";
import md5 from 'md5'

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 }
};
const formTailLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16, offset: 4 }
};
export default {
  components: {
    FSpaceHeader,
    FSpaceFooter
  },
  data() {
    return {
      loading: false,
      captchaURL: '',
      isCaptcha: false,
      isSavePwd: false,
      formItemLayout,
      formTailLayout,
      captchaKey: 'uncheck',
      form: null
    };
  },
  mounted() {
    this.form = this.$form.createForm(this);
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault();
      this.form.validateFields((err, values) => {
        if (!err) {
          this.login(values)
        }
      });
    },
    // 获取图形验证码
    getCaptcha() {
      let _this = this;
      let iRequest = new inf.IRequest();
      iRequest.cls = "LoginRegistrationModule";
      iRequest.method = "obtainVerificationCode";
      iRequest.param.json = JSON.stringify({
        type: 1
      })
      iRequest.param.token = localStorage.getItem("identification")
      this.$refcallback(
        this,
        "userServer",
        iRequest,
        new this.$iceCallback(
          function result(result) {
            if(result.code == 200) {
              _this.captchaURL = JSON.parse(result.data).url + '?' + Math.random();
              _this.captchaKey = JSON.parse(result.data).key
            }
          }
        )
      );
    },
    login(values) {
      let _this = this;
      _this.loading = true
      let iRequest = new inf.IRequest();
      iRequest.cls = "LoginRegistrationModule";
      iRequest.method = "loginStore";
      iRequest.param.json = JSON.stringify({
        phone: values.phone,
        password: md5(values.password),
        verification: values.verification ? values.verification : '',
        key: this.captchaKey
      })
      iRequest.param.token = localStorage.getItem("identification")
      this.$refcallback(
        this,
        "userServer",
        iRequest,
        new this.$iceCallback(
          function result(result) {
            if(result.code == 200) {
              _this.$store
                .dispatch("setUserStatus", { context: _this, status: result.data })
                .then(res => {
                  _this.getBasicInfo();
                })
                .catch(err => {
              });
            }else {
              _this.loading = false
              if(result && result.map && result.map.index >= 3) {
                _this.isCaptcha = true
                _this.getCaptcha();
              }
            }
          },function error(error) {
            _this.loading = false
          }
        )
      );
    },
    // 获取详情
    getBasicInfo() {
      let _this = this;
      let iRequest = new inf.IRequest();
      iRequest.cls = "LoginRegistrationModule";
      iRequest.method = "getStoreSession";
      iRequest.param.token = localStorage.getItem("identification");
      this.$refcallback(
        this,
        "userServer",
        iRequest,
        new this.$iceCallback(function result(result) {
          if (result.code == 200 && result.data) {
            _this.$store.dispatch("setUser", {
              context: _this,
              user: result.data
            }).then(res => {
              // 登录成功
              _this.$router.push({
                name: 'index'
              })
            })
          } else {
            // 未关联企业
            _this.$store.dispatch("setUser", {
              context: _this,
              user: {
                comp: {
                  storeName: '',
                  storeId: 0,
                  address: ''
                },
                compId: 0,
                phone: ''
              }
            }).then(res => {
              // 登录成功
              _this.$router.push({
                name: 'index'
              })
            })
          }
        })
      );
    },
    validatePhone(rule, value, callback) {
      let _this = this;
      const form = this.form;
      if (value && value.length == 11) {
        callback()
      } else {
        this.sendAuthCode = false
        callback('请输入手机正确的手机号码');
      }
    },
    validatePwd(rule, value, callback) {
      const form = this.form;
      if (value && value.length > 5) {
        callback();
      } else {
        callback("请输入正确的密码");
      }
    },
    toForget() {
      this.$router.push({
        path: '/user/forget-pwd'
      })
    }
  }
};
</script> 
<style lang="less" scoped>
@import "../../components/fspace-ui/container/index.less";
@import "../../components/fspace-ui/button/index.less";

.login-box {
  .container-size(block, 100%, 578px, 0 auto);
  background: #fafafa;
  background: url(../../assets/img/login-pic.png) no-repeat;
  background-position: 100% 100%;
}
// .right-float {
//   .container-size(block, 1190px, 400px, 0 auto);
//   margin-top: 20px;
// }
.login-input {
  float: right;
  .container-size(block, 390px, 400px, 0 auto, 5px);
  margin-right: 200px;
  margin-top: 90px;
  background: #ffffff;
  padding: 20px 0px;
  padding-left: 45px;
  padding-right: 20px;
}
.user-login {
  height: 50px;
  line-height: 50px;
  text-indent: 12px;
  font-size: 16px;
  font-weight: bold;
}
.login-btn {
  margin-right: 20px;
  .button-size(228px, 50px, 50px, 16px, 0px, 5px);
  .button-color(1px solid transparent, #317ff5, #ffffff);
}
.login-btn :hover {
  opacity: 0.8;
}
.register {
  text-align: center;
}
.ant-input {
  border: 1px solid rgb(238, 238, 238);
  border-radius: 0px;
}
.to-register {
  text-align: center;
}
.forget{
  float: left;
  margin-left: 10px;
}
.forget:hover{
  cursor: pointer;
  color: #ed3025;
}
.ant-input{
  border-radius: 0px!important;
  -moz-border-radius:0px!important;
  -webkit-border-radius:0px!important;
}
</style>