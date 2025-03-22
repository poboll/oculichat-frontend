import {ProLayoutProps} from '@ant-design/pro-components';

const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
  navTheme?: string
} = {
  navTheme: 'light',
  // 使用您的主色调
  colorPrimary: "hsl(205, 35%, 30%)",
  // 可以添加其他颜色配置
  token: {
    // 这里定义全局 token
    colorBgContainer: "rgba(255, 255, 255, 0.7)", // 保持毛玻璃效果的背景色
    colorPrimary: "hsl(205, 35%, 30%)",
    colorInfo: "hsl(205, 35%, 30%)",
    colorSuccess: "hsl(173, 58%, 39%)",
    colorWarning: "hsl(43, 74%, 66%)",
    colorError: "hsl(0, 84.2%, 60.2%)",
  },
  // ... existing code ...
  layout: 'top',
  contentWidth: 'Fluid',
  fixedHeader: true,
  fixSiderbar: true,
  colorWeak: false,
  splitMenus: false,
  title: 'Oculichat 眼底辅助诊断开放平台',
  pwa: false,
  iconfontUrl: '/logo.gif',
};

export default Settings;
