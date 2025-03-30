import {GithubOutlined, InfoCircleOutlined, WechatOutlined} from '@ant-design/icons';
import {DefaultFooter} from '@ant-design/pro-components';
import '@umijs/max';
import React from 'react';
import {Tooltip} from "antd";
import {useLocation} from "@umijs/max";

const wechat = "/assets/WeChat.png";

// 不显示脚注的页面列表
const hideFooterPaths = ['/selfdeployai', '/accessaiservices'];

const Footer: React.FC = () => {
  const { pathname } = useLocation();

  // 如果当前路径在隐藏列表中，不渲染footer
  if (hideFooterPaths.includes(pathname)) {
    return null;
  }
  const defaultMessage = '温瞳工作室出品';
  const currentYear = new Date().getFullYear();
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      // @ts-ignore
      copyright={<>
        {`${currentYear} ${defaultMessage}`} |{' '}
        憧憬
        {" | "}
        <a target={'_blank'} href={'https://icp.gov.moe/?keyword=20230744'} rel="noreferrer">
          <img
            src="https://icp.gov.moe/images/ico64.png"
            alt={'萌ICP备 20230744号'}
            style={{ verticalAlign: 'middle', height: '16px', marginRight: '4px' }} // Align image with text
          />
          萌ICP备20230744号
        </a>
      </>}
      links={[
        {
          key: 'github',
          title: (
            <Tooltip title="查看本站技术及源码，欢迎 star">
              <GithubOutlined/> 支持项目
            </Tooltip>
          ),
          href: 'https://github.com/poboll/cai-api',
          blankTarget: true,
        },
        {
          key: 'contact',
          title: (
            <Tooltip title={<img src={wechat} alt="微信 code_nav" width="120"/>}>
              <WechatOutlined/> 联系作者
            </Tooltip>
          ),
          href: '/assets/WeChat.png',
          blankTarget: true,
        },
        {
          key: 'info',
          title: (
            <>
              <InfoCircleOutlined/> 免责声明
            </>
          ),
          href: 'https://github.com/poboll/cai-api-frontend/statement/UserAgreement.md',
          blankTarget: true,
        }
      ]}
    />
  );
};
export default Footer;
