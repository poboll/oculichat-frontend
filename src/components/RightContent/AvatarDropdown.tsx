import { outLogin } from '@/services/ant-design-pro/api';
import { LogoutOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import {Avatar, Spin} from 'antd';
import { createStyles } from 'antd-style';
import { stringify } from 'querystring';
import type { MenuInfo } from 'rc-menu/lib/interface';
import React, { useCallback } from 'react';
import { flushSync } from 'react-dom';
import HeaderDropdown from '../HeaderDropdown';
import {userLogoutUsingPost} from "@/services/cai-api-backend/userController";

export type GlobalHeaderRightProps = {
  menu?: boolean;
  children?: React.ReactNode;
};

export const AvatarName = () => {
  const { initialState } = useModel('@@initialState');
  const { loginUser } = initialState || {};
  return <span className="anticon">{loginUser?.userName}</span>;
};

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      display: 'flex',
      height: '48px',
      marginLeft: 'auto',
      overflow: 'hidden',
      alignItems: 'center',
      padding: '0 8px',
      cursor: 'pointer',
      borderRadius: token.borderRadius,
      '&:hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
  };
});

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu, children }) => {
  /**
   * 退出登录，并且将当前的 url 保存
   */
  const loginOut = async () => {
    await outLogin();
    const { search, pathname } = window.location;
    const urlParams = new URL(window.location.href).searchParams;
    /** 此方法会跳转到 redirect 参数所在的位置 */
    const redirect = urlParams.get('redirect');
    // Note: There may be security issues, please note
    if (window.location.pathname !== '/user/login' && !redirect) {
      history.replace({
        pathname: '/user/login',
        search: stringify({
          redirect: pathname + search,
        }),
      });
    }
  };
  const { styles } = useStyles();

  const { initialState, setInitialState } = useModel('@@initialState');

  const defaultUserAvatar = 'https://pic.imgdb.cn/item/656c4215c458853aefb6be13.png'; // 默认头像
  const defaultUserName = '在在'; // 默认用户名

  const onMenuClick = useCallback(
    async (event: MenuInfo) => {
      const { key } = event;
      if (key === 'logout') {
        // 清空用户状态
        flushSync(() => {
          setInitialState((s) => ({ ...s, loginUser: undefined }));
        });
        try {
          // 异步等待登出请求完成
          await userLogoutUsingPost();
          // 执行跳转到登录页的逻辑
          history.replace({
            pathname: '/user/login',
          });
          // 刷新页面，确保所有状态被清除
          window.location.reload();
        } catch (error) {
          console.error('Logout failed: ', error);
        }
        return;
      }

      // 处理其他菜单项的跳转
      history.push(`/account/${key}`);
    },
    [setInitialState],
  );


  const loading = (
    <span className={styles.action}>
      <Spin
        size="small"
        style={{
          marginLeft: 8,
          marginRight: 8,
        }}
      />
    </span>
  );

  if (!initialState) {
    return loading;
  }

  const { loginUser } = initialState;
  const userName = loginUser?.userName || defaultUserName;
  const userAvatar = loginUser?.userAvatar || defaultUserAvatar;

  if (!loginUser || !loginUser.userName) {
    return loading;
  }

  const menuItems = [
    ...(menu
      ? [
          {
            key: 'center',
            icon: <UserOutlined />,
            label: '个人中心',
          },
          {
            key: 'settings',
            icon: <SettingOutlined />,
            label: '个人设置',
          },
          {
            type: 'divider' as const,
          },
        ]
      : []),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  return (
    <HeaderDropdown
      menu={{
        selectedKeys: [],
        onClick: onMenuClick,
        items: menuItems,
      }}
    >
    <span className={styles.action}>
      {/* 增加用户头像显示 */}
      <Avatar
        src={userAvatar || 'https://pic.imgdb.cn/item/656c4215c458853aefb6be13.png'}
        alt="avatar"
        style={{ marginRight: 8 }}
      />
      <span>{userName || '呜、还没设置唉'}</span>
    </span>
    </HeaderDropdown>
  );
};
