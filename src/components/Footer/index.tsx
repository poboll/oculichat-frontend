import { GithubOutlined, InfoCircleOutlined } from '@ant-design/icons'; // 导入 InfoCircleOutlined 图标
import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright="在在"
      links={[
        {
          key: 'Ant Design Pro',
          title: 'Ant Design Pro',
          href: 'https://pro.ant.design',
          blankTarget: true,
        },
        {
          key: 'github',
          title: <GithubOutlined />,
          href: 'https://github.com/ant-design/ant-design-pro',
          blankTarget: true,
        },
        {
          key: 'Ant Design',
          title: 'Ant Design',
          href: 'https://ant.design',
          blankTarget: true,
        },
        {
          key: 'disclaimer',
          title: (
            <>
              <InfoCircleOutlined /> 免责声明
            </>
          ),
          href: '/disclaimer', // 免责声明页面链接
          blankTarget: true,
        },
      ]}
    />
  );
};

export default Footer;
