<p align="center">
    <img src=https://github.com/poboll/oculichat-frontend/blob/main/public/logo.gif?raw=true width=188/>
</p>
<h1 align="center">Oculichat 眼智医前端仓库</h1>
<p align="center"><strong>oculichat 眼智医-眼底智能辅助诊疗系统是一个为医生和患者提供辅助诊疗综合服务一站式服务的平台 🛠</strong></p>
<div align="center">
<a target="_blank" href="https://github.com/poboll/oculichat-frontend">
    <img alt="" src="https://github.com/poboll/oculichat-frontend/badge/star.svg?theme=gvp"/>
</a>
    <img alt="Maven" src="https://raster.shields.io/badge/Maven-3.8.1-red.svg"/>
<a target="_blank" href="https://www.oracle.com/technetwork/java/javase/downloads/index.html">
        <img alt="" src="https://img.shields.io/badge/JDK-1.8+-green.svg"/>
</a>
    <img alt="SpringBoot" src="https://raster.shields.io/badge/SpringBoot-2.7+-green.svg"/>
<a href="https://github.com/poboll/oculichat-frontend" target="_blank">
    <img src='https://img.shields.io/github/forks/poboll/oculichat-frontend' alt='GitHub forks' class="no-zoom">
</a>
<a href="https://github.com/poboll/oculichat-frontend" target="_blank"><img src='https://img.shields.io/github/stars/poboll/oculichat-frontend' alt='GitHub stars' class="no-zoom">
</a>
</div>

## 项目介绍 🙋

**😀 作为用户您可以通过注册登录账户，获取接口调用权限，并根据自己的需求浏览和选择适合的接口。您可以在线进行接口调试，快速验证接口的功能和效果。**

**💻 作为开发者 我们提供了[客户端SDK: CAI-API-SDK](https://github.com/poboll/cai-api-sdk)， 通过[开发者凭证](https://api.caiths.com/account/center)即可将轻松集成接口到您的项目中，实现更高效的开发和调用。**

**🤝 您可以将自己的接口接入到oculichat-frontend 接口开放平台平台上，并发布给其他用户使用。 您可以管理和各个接口，以便更好地分析和优化接口性能。**

**👌 我们还提供了[开发者在线文档](https://ocu-docs.caiths.com)和技术支持，帮助您快速接入和发布接口。**

**🏁 无论您是用户还是开发者，oculichat-frontend 接口开放平台都致力于提供稳定、安全、高效的接口调用服务，帮助您实现更快速、便捷的开发和调用体验。**

## 网站导航 🧭

- [**oculichat-frontend 后端 🏘️**](https://github.com/poboll/oculichat-frontend)
- [**oculichat-frontend 前端 🏘**️](https://github.com/poboll/oculichat-frontend-frontend)

-  **[CAI-API-SDK](https://github.com/poboll/cai-api-sdk)** 🛠

-  **[oculichat-frontend 眼疾辅助诊断开放平台 🔗](https://ocu.caiths.com/)**

-  **[oculichat-frontend-DOC 开发者文档 📖](https://ocu-docs.caiths.com)**
-  **[CAI-API-SDK-demo ✔️](https://github.com/poboll/cai-api-sdk-demo/blob/main/src/main/java/com/caiths/caiapisdkdemo/controller/InvokeController.java)**


## 目录结构 📑

| 目录                                                                                                                                                       | 描述            |
|----------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| **🏘️ [oculichat-frontend-backend](https://github.com/poboll/oculichat-frontend/oculichat-frontend-backend)**                                                                             | oculichat-frontend后端服务模块 |
| **🏘️ [oculichat-frontend-common](https://github.com/poboll/oculichat-frontend/oculichat-frontend-common)**                                                                               | 公共服务模块        |
| **🕸️ [oculichat-frontend-gateway](https://github.com/poboll/oculichat-frontend/oculichat-frontend-gateway)**                                                                             | 网关模块          |
| **🔗 [oculichat-frontend-interface](https://github.com/poboll/oculichat-frontend/oculichat-frontend-interface)**                                                                          | 接口模块          |
| **🛠 [oculichat-frontend-sdk](https://github.com/poboll/oculichat-frontend-sdk)**                                                                                              | 开发者调用sdk      |
| **📘 [oculichat-frontend-doc](https://api-docs.caiths.com)**                                                                                                        | 接口在线文档        |
| **✔️ [oculichat-frontend-sdk-demo](https://github.com/poboll/oculichat-frontend-sdk-demo/blob/1.0.0/src/main/java/com/caiths/caiapisdkdemo/controller/InvokeController.java)** | SDK调用Demo     |

## 项目流程 🗺️

![项目流程](https://github.com/user-attachments/assets/1ad04133-1625-478b-bbe5-30bd9f0ab8cb)

## 快速启动 🚀

### 前端

环境要求：Node.js >= 16

安装依赖：

```bash
pnpmm install
```

启动：

```bash
pnpm run dev
```

部署：

```bash
pnpm build
```

### 后端

执行sql目录下ddl.sql

## 项目选型 🎯

### **后端**

- Spring Boot 2.7.0
- Spring MVC
- MySQL 数据库
- 腾讯云COS存储
- Dubbo 分布式（RPC、Nacos）
- Spring Cloud Gateway 微服务网关
- API 签名认证（Http 调用）
- IJPay-AliPay  支付宝支付
- WeiXin-Java-Pay  微信支付
- Swagger + Knife4j 接口文档
- Spring Boot Starter（SDK 开发）
- Jakarta.Mail 邮箱通知、验证码
- Spring Session Redis 分布式登录
- Apache Commons Lang3 工具类
- MyBatis-Plus 及 MyBatis X 自动生成
- Hutool、Apache Common Utils、Gson 等工具库

### 前端

- React 18

- Ant Design Pro 5.x 脚手架

- Ant Design & Procomponents 组件库

- Umi 4 前端框架

- OpenAPI 前端代码生成



## 功能介绍 📋

`坤币`即积分，用于平台接口调用。

| **功能**                                                     | 游客 | **普通用户** | **管理员** |
|------------------------------------------------------------|----|----------|---------|
| [**CAI-API-SDK**](https://github.com/poboll/cai-api-sdk)使用 | ✅  | ✅        | ✅       |
| **[开发者API在线文档](http://ocu-docs.caiths.com)**               | ✅  | ✅        | ✅       |
| 邀请好友注册得坤币                                                  | ❌  | ✅        | ✅       |
| 切换主题、深色、暗色                                                 | ✅  | ✅        | ✅       |
| 微信支付宝付款                                                    | ❌  | ✅        | ✅       |
| 在线调试接口                                                     | ❌  | ✅        | ✅       |
| 每日签到得坤币                                                    | ❌  | ✅        | ✅       |
| 接口大厅搜索接口、浏览接口                                              | ✅  | ❌        | ✅       |
| 邮箱验证码登录注册                                                  | ✅  | ✅        | ✅       |
| 钱包充值                                                       | ❌  | ❌        | ✅       |
| 支付成功邮箱通知(需要绑定邮箱)                                           | ❌  | ✅        | ✅       |
| 更新头像                                                       | ❌  | ✅        | ✅       |
| 绑定、换绑、解绑邮箱                                                 | ❌  | ✅        | ✅       |
| 取消订单、删除订单                                                  | ❌  | ✅        | ✅       |
| 商品管理、上线、下架                                                 | ❌  | ❌        | ✅       |
| 用户管理、封号解封等                                                 | ❌  | ❌        | ✅       |
| 接口管理、接口发布审核、下架                                             | ❌  | ❌        | ✅       |
| 退款                                                         | ❌  | ❌        | ❌       |
