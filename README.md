<p align="center">
    <img src=https://github.com/user-attachments/assets/f7c5f6bb-164d-4ec5-8e35-720e5076a50c width=188/>
</p>
<h1 align="center">Cai-API 接口开放平台</h1>
<p align="center"><strong>Cai-API 接口开放平台是一个为用户和开发者提供全面API接口调用服务的平台 🛠</strong></p>
<div align="center">
<a target="_blank" href="https://github.com/poboll/cai-api">
    <img alt="" src="https://github.com/poboll/cai-api/badge/star.svg?theme=gvp"/>
</a>
    <img alt="Maven" src="https://raster.shields.io/badge/Maven-3.8.1-red.svg"/>
<a target="_blank" href="https://www.oracle.com/technetwork/java/javase/downloads/index.html">
        <img alt="" src="https://img.shields.io/badge/JDK-1.8+-green.svg"/>
</a>
    <img alt="SpringBoot" src="https://raster.shields.io/badge/SpringBoot-2.7+-green.svg"/>
<a href="https://github.com/poboll/cai-api" target="_blank">
    <img src='https://img.shields.io/github/forks/poboll/cai-api' alt='GitHub forks' class="no-zoom">
</a>
<a href="https://github.com/poboll/cai-api" target="_blank"><img src='https://img.shields.io/github/stars/poboll/cai-api' alt='GitHub stars' class="no-zoom">
</a>
</div>

## 项目介绍 🙋



**😀 作为用户您可以通过注册登录账户，获取接口调用权限，并根据自己的需求浏览和选择适合的接口。您可以在线进行接口调试，快速验证接口的功能和效果。**

**💻 作为开发者 我们提供了[客户端SDK: Cai-API-SDK](https://github.com/poboll/cai-api-sdk)， 通过[开发者凭证](https://api.caiths.com/account/center)即可将轻松集成接口到您的项目中，实现更高效的开发和调用。**

**🤝 您可以将自己的接口接入到Cai-API 接口开放平台平台上，并发布给其他用户使用。 您可以管理和各个接口，以便更好地分析和优化接口性能。**

**👌 我们还提供了[开发者在线文档](https://api-docs.caiths.com)和技术支持，帮助您快速接入和发布接口。**

**🏁 无论您是用户还是开发者，Cai-API 接口开放平台都致力于提供稳定、安全、高效的接口调用服务，帮助您实现更快速、便捷的开发和调用体验。**

## 网站导航 🧭

- [**Cai-API 后端 🏘️**](https://github.com/poboll/cai-api)
- [**Cai-API 前端 🏘**️](https://github.com/poboll/cai-api-frontend)

-  **[Cai-API-SDK](https://github.com/poboll/cai-api-sdk)** 🛠

-  **[Cai-API 接口开放平台 🔗](https://api.caiths.com/)**

-  **[Cai-API-DOC 开发者文档 📖](https://api-docs.caiths.com)**
-  **[Cai-API-SDK-demo ✔️](https://github.com/poboll/cai-api-sdk-demo/blob/main/src/main/java/com/caiths/caiapisdkdemo/controller/InvokeController.java)**


## 目录结构 📑


| 目录                                                                                                                                                       | 描述            |
|----------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| **🏘️ [cai-api-backend](https://github.com/poboll/cai-api/cai-api-backend)**                                                                             | Cai-API后端服务模块 |
| **🏘️ [cai-api-common](https://github.com/poboll/cai-api/cai-api-common)**                                                                               | 公共服务模块        |
| **🕸️ [cai-api-gateway](https://github.com/poboll/cai-api/cai-api-gateway)**                                                                             | 网关模块          |
| **🔗 [cai-api-interface](https://github.com/poboll/cai-api/cai-api-interface)**                                                                          | 接口模块          |
| **🛠 [cai-api-sdk](https://github.com/poboll/cai-api-sdk)**                                                                                              | 开发者调用sdk      |
| **📘 [cai-api-doc](https://api-docs.caiths.com)**                                                                                                        | 接口在线文档        |
| **✔️ [cai-api-sdk-demo](https://github.com/poboll/cai-api-sdk-demo/blob/1.0.0/src/main/java/com/caiths/caiapisdkdemo/controller/InvokeController.java)** | SDK调用Demo     |

## 项目流程 🗺️

![项目流程](https://github.com/user-attachments/assets/1ad04133-1625-478b-bbe5-30bd9f0ab8cb)

## 快速启动 🚀

### 前端

环境要求：Node.js >= 16

安装依赖：

```bash
yarn or  npm install
```

启动：

```bash
yarn run dev or npm run start:dev
```

部署：

```bash
yarn build or npm run build
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
| [**Cai-API-SDK**](https://github.com/poboll/cai-api-sdk)使用 | ✅  | ✅        | ✅       |
| **[开发者API在线文档](http://api-docs.caiths.com)**               | ✅  | ✅        | ✅       |
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

## 功能展示 ✨

### 首页

![1 首页-日间](https://github.com/user-attachments/assets/a2ee1065-da5a-4645-9ab9-1a9f0a9d7c85)

### 接口广场

![2 接口广场](https://github.com/user-attachments/assets/f30e722e-a745-4e80-85f9-d789986a5afb)

### 开发者在线文档

#### 首页
![3 开发者在线文档-首页](https://github.com/user-attachments/assets/b5a1213c-dfac-4c3a-b42f-98f159c4acf8)

#### 接口介绍
![4 开发者在线文档-接口介绍](https://github.com/user-attachments/assets/1c039e74-c7e4-437f-81b3-cd7935af6eed)

### 接口描述

#### **在线API**
![5 接口描述-在线api](https://github.com/user-attachments/assets/d76cd126-7c61-44b3-a34a-257028d5e383)

#### 在线调试工具
![6 接口描述-在线调试工具](https://github.com/user-attachments/assets/769c06c6-5574-45cb-8e70-9077dc3d3e33)

#### **错误码参考**
![7 接口描述-错误码参照](https://github.com/user-attachments/assets/6eacce15-cb9b-42de-aa3f-feb3fb2fc304)

#### **接口调用代码示例**
![8 接口描述-接口调用代码示例](https://github.com/user-attachments/assets/c1537e54-67c9-4d45-9654-026a0931e994)

### 管理页

#### 用户管理
![9 接口管理-用户管理](https://github.com/user-attachments/assets/384e32c1-fd16-4edf-834c-41d617fdb266)

#### 商品管理
![10 接口管理-商品管理](https://github.com/user-attachments/assets/a903a5b3-4fac-44a3-bc63-87d7399e0c2f)

#### 接口管理
![11 管理页-接口管理](https://github.com/user-attachments/assets/b5f859d1-4b6a-459c-a637-2d7e63c1dd67)

#### 动态更新请求响应参数
![12 管理页-接口管理-动态更新请求响应参数](https://github.com/user-attachments/assets/bf6c1529-0f07-4e81-a859-74bf5bb81f84)

### 积分商城
![13 积分商城](https://github.com/user-attachments/assets/9c7458fc-a917-416b-8d1d-f28f55ce87ab)

#### 支付宝支付
![15 订单支付-支付宝支付](https://github.com/user-attachments/assets/27df24dc-ecf4-46a6-a02a-738fd5e8fc65)

#### 支付宝支付成功
![16 订单支付-支付宝支付成功](https://github.com/user-attachments/assets/c0d1f12d-3887-44a4-849a-e7bd0a576f57)

### 订单支付
![14 订单支付](https://github.com/user-attachments/assets/04cbd202-5573-4262-9357-977d87f5b0ab)

### 个人信息

#### 每日签到
##### 签到成功
![19 每日签到-签到成功](https://github.com/user-attachments/assets/b91faa70-241e-42f9-9050-11b9723a4222)

##### 签到失败
![20 每日签到-签到失败](https://github.com/user-attachments/assets/0fdad81e-8354-4471-b46b-bb1694db4f30)

### 好友邀请

#### **发送邀请**
![21 好友邀请-发送邀请](https://github.com/user-attachments/assets/15aa0b4a-6698-4827-acde-785ee648d3c3)

#### **接受邀请**
![22 好友邀请-接受邀请](https://github.com/user-attachments/assets/aa74fffd-54e0-4f4d-bbc8-4f2898bbd67c)

### 登录/注册
#### 登录
![23 登录:注册-登录](https://github.com/user-attachments/assets/68acb5e5-6ab6-4133-a0cc-d7a50f5bfd98)

#### 注册
![24 登录:注册-注册](https://github.com/user-attachments/assets/690a1f84-bdd7-44e1-8d92-1dac72ade9ba)

### 订单管理

- **我的订单**![17 订单管理-我的订单](https://github.com/user-attachments/assets/dd8337f6-8cf3-4c39-ae7d-0d2852b827c6)

- **详细订单**![18 订单管理-详细订单](https://github.com/user-attachments/assets/1618fe73-8c8d-4c51-977b-02094bec450a)

### 主题切换

#### 浅色主题![1 首页-日间](https://github.com/user-attachments/assets/6c78f283-5711-4694-95a6-def446f51531)

#### 深色主题![2 首页-夜间](https://github.com/user-attachments/assets/586c2055-9eef-41af-b2e1-96264c8d732f)
