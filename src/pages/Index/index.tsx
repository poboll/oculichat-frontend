import { listInterfaceInfoByPageUsingGet } from '@/services/cai-api-backend/interfaceInfoController';
import { PageContainer } from '@ant-design/pro-components';
import { List, message } from 'antd';
import React, { useEffect, useState } from 'react';

/**
 * 主页组件
 * @constructor
 * @returns {JSX.Element} 返回主页的 JSX 元素
 */
const Index: React.FC = () => {
  // 定义状态，loading用于指示数据是否正在加载，list用于存储接口信息列表，total用于存储接口信息总数
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<API.InterfaceInfo[]>([]);
  const [total, setTotal] = useState<number>(0);

  /**
   * 加载数据的异步函数
   * @param {number} current - 当前页码，默认为1
   * @param {number} pageSize - 每页显示的条目数，默认为10
   */
  const loadData = async (current = 1, pageSize = 10) => {
    // 设置loading状态为true，表示数据正在加载
    setLoading(true);
    try {
      // 调用API获取数据，并等待返回结果
      const res = await listInterfaceInfoByPageUsingGet({
        current,
        pageSize,
      });

      // 设置接口信息列表和总数，使用可选链操作符避免出现undefined
      setList(res?.data?.records ?? []);
      setTotal(res?.data?.total ?? 0);
    } catch (error: any) {
      setLoading(false);
      // 捕获错误并显示提示信息
      message.error('请求失败，' + error.message);
    }
    // 数据加载完成，设置loading状态为false
    setLoading(false);
  };

  // 使用useEffect钩子在组件挂载时加载数据
  useEffect(() => {
    loadData();
  }, []);

  return (
    <PageContainer title="在线接口开放平台">
      <List
        className="my-list"
        loading={loading} // 控制列表的loading状态
        itemLayout="horizontal" // 列表项的布局为水平
        dataSource={list} // 列表的数据源
        pagination={{
          showSizeChanger: true,
          total: total, // 总条目数
          showTotal(total, range) {
            return `总数：${range[0]}-${range[1]} / ${total}`;
          },
          onChange(page, pageSize) {
            loadData(page, pageSize); // 页码变化时加载新数据
          },
        }}
        // 修改动态路由跳转
        renderItem={(item) => {
          const infoLink = `/interface_info/${item.id}`;
          return (
            <List.Item
              actions={[
                <a key="list-loadmore" href={infoLink}>
                  查看详情
                </a>, // 列表项的操作按钮
              ]}
            >
              <List.Item.Meta
                title={<a href={infoLink}>{item.name}</a>} // 列表项的标题
                description={item.description} // 列表项的描述
              />
              <div>{item.method}</div>
            </List.Item>
          );
        }}
      />
    </PageContainer>
  );
};

export default Index;
