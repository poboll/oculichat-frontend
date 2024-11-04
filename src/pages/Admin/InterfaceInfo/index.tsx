import CreateModal from '@/pages/Admin/InterfaceInfo/components/CreateModal';
import UpdateModal from '@/pages/Admin/InterfaceInfo/components/UpdateModal';
import {
  addInterfaceInfoUsingPost,
  deleteInterfaceInfoUsingPost,
  listInterfaceInfoByPageUsingGet,
  offlineInterfaceInfoUsingPost,
  onlineInterfaceInfoUsingPost,
  updateInterfaceInfoUsingPost,
} from '@/services/cai-api-backend/interfaceInfoController';
import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { FormattedMessage, useIntl } from '@umijs/max';
import { Button, Drawer, message } from 'antd';
import React, { useRef, useState } from 'react';

const TableList: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalOpen, handleModalOpen] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  const [selectedRowsState, setSelectedRows] = useState<API.RuleListItem[]>([]);

  /**
   * @en-US Add node
   * @zh-CN 添加节点
   * @param fields
   */
  const handleAdd = async (fields: API.InterfaceInfoAddRequest) => {
    const hide = message.loading('正在添加');
    try {
      await addInterfaceInfoUsingPost({ ...fields });
      hide();
      message.success('创建成功');
      // 关闭Modal
      handleModalOpen(false);
      // 设置自动刷新
      actionRef.current?.reload();
      return true;
    } catch (error: any) {
      hide();
      console.log(error);
      message.error('创建失败，' + error.message);
      return false;
    }
  };

  /**
   * @en-US Update InterfaceInfo
   * @zh-CN 更新接口信息
   *
   * @param fields
   */
  const handleUpdate = async (fields: API.InterfaceInfoUpdateRequest) => {
    const hide = message.loading('正在更新');
    try {
      if (!currentRow) {
        return false;
      }
      let res = await updateInterfaceInfoUsingPost({
        // 因为columns中的id valueType为index 不会传递 所以我们需要手动赋值id
        id: currentRow.id,
        ...fields,
      });
      if (res.data) {
        hide();
        handleUpdateModalOpen(false);
        message.success('更新成功!');
        // 刷新页面
        actionRef.current?.reload();
        return true;
      }
    } catch (error: any) {
      hide();
      message.error('更新失败，' + error.message);
      return false;
    }
  };

  /**
   *  Delete node
   * @zh-CN 删除节点
   *
   * @param record
   */
  const handleRemove = async (record: API.InterfaceInfo) => {
    const hide = message.loading('正在删除');
    if (!record) return true;
    try {
      await deleteInterfaceInfoUsingPost({
        id: record.id,
      });
      hide();
      message.success('删除成功！');
      // 刷新页面
      actionRef.current?.reload();
      return true;
    } catch (error: any) {
      hide();
      message.error('删除失败，' + error.message);
      return false;
    }
  };

  /**
   * 发布接口
   * @zh-CN 上线接口
   *
   * @param record
   */
  const handleOnline = async (record: API.DeleteRequest) => {
    const hide = message.loading('正在上线');
    if (!record) return true;
    try {
      await onlineInterfaceInfoUsingPost({
        id: record.id,
      });
      hide();
      message.success('上线成功！');
      // 刷新页面
      actionRef.current?.reload();
      return true;
    } catch (error: any) {
      hide();
      message.error('上线失败，' + error.message);
      return false;
    }
  };

  /**
   * 下线接口
   * @zh-CN 下线接口
   *
   * @param record
   */
  const handleOffline = async (record: API.DeleteRequest) => {
    const hide = message.loading('正在下线');
    if (!record) return true;
    try {
      await offlineInterfaceInfoUsingPost({
        id: record.id,
      });
      hide();
      message.success('下线成功！');
      // 刷新页面
      actionRef.current?.reload();
      return true;
    } catch (error: any) {
      hide();
      message.error('下线失败，' + error.message);
      return false;
    }
  };

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */
  const intl = useIntl();

  // const columns: ProColumns<API.InterfaceInfo>[] = [
  //   {
  //     title: (
  //       <FormattedMessage
  //         id="pages.searchTable.updateForm.ruleName.nameLabel"
  //         defaultMessage="Rule name"
  //       />
  //     ),
  //     dataIndex: 'name',
  //     tip: 'The rule name is the unique key',
  //     render: (dom, entity) => {
  //       return (
  //         <a
  //           onClick={() => {
  //             setCurrentRow(entity);
  //             setShowDetail(true);
  //           }}
  //         >
  //           {dom}
  //         </a>
  //       );
  //     },
  //   },
  //   {
  //     title: <FormattedMessage id="pages.searchTable.titleDesc" defaultMessage="Description" />,
  //     dataIndex: 'desc',
  //     valueType: 'textarea',
  //   },
  //   {
  //     title: (
  //       <FormattedMessage
  //         id="pages.searchTable.titleCallNo"
  //         defaultMessage="Number of service calls"
  //       />
  //     ),
  //     dataIndex: 'callNo',
  //     sorter: true,
  //     hideInForm: true,
  //     renderText: (val: string) =>
  //       `${val}${intl.formatMessage({
  //         id: 'pages.searchTable.tenThousand',
  //         defaultMessage: ' 万 ',
  //       })}`,
  //   },
  //   {
  //     title: <FormattedMessage id="pages.searchTable.titleStatus" defaultMessage="Status" />,
  //     dataIndex: 'status',
  //     hideInForm: true,
  //     valueEnum: {
  //       0: {
  //         text: (
  //           <FormattedMessage
  //             id="pages.searchTable.nameStatus.default"
  //             defaultMessage="Shut down"
  //           />
  //         ),
  //         status: 'Default',
  //       },
  //       1: {
  //         text: (
  //           <FormattedMessage id="pages.searchTable.nameStatus.running" defaultMessage="Running" />
  //         ),
  //         status: 'Processing',
  //       },
  //       2: {
  //         text: (
  //           <FormattedMessage id="pages.searchTable.nameStatus.online" defaultMessage="Online" />
  //         ),
  //         status: 'Success',
  //       },
  //       3: {
  //         text: (
  //           <FormattedMessage
  //             id="pages.searchTable.nameStatus.abnormal"
  //             defaultMessage="Abnormal"
  //           />
  //         ),
  //         status: 'Error',
  //       },
  //     },
  //   },
  //   {
  //     title: (
  //       <FormattedMessage
  //         id="pages.searchTable.titleUpdatedAt"
  //         defaultMessage="Last scheduled time"
  //       />
  //     ),
  //     sorter: true,
  //     dataIndex: 'updatedAt',
  //     valueType: 'dateTime',
  //     renderFormItem: (item, { defaultRender, ...rest }, form) => {
  //       const status = form.getFieldValue('status');
  //       if (`${status}` === '0') {
  //         return false;
  //       }
  //       if (`${status}` === '3') {
  //         return (
  //           <Input
  //             {...rest}
  //             placeholder={intl.formatMessage({
  //               id: 'pages.searchTable.exception',
  //               defaultMessage: 'Please enter the reason for the exception!',
  //             })}
  //           />
  //         );
  //       }
  //       return defaultRender(item);
  //     },
  //   },
  //   {
  //     title: <FormattedMessage id="pages.searchTable.titleOption" defaultMessage="Operating" />,
  //     dataIndex: 'option',
  //     valueType: 'option',
  //     render: (_, record) => [
  //       <a
  //         key="config"
  //         onClick={() => {
  //           handleUpdateModalOpen(true);
  //           setCurrentRow(record);
  //         }}
  //       >
  //         <FormattedMessage id="pages.searchTable.config" defaultMessage="Configuration" />
  //       </a>,
  //       <a key="subscribeAlert" href="https://procomponents.ant.design/">
  //         <FormattedMessage
  //           id="pages.searchTable.subscribeAlert"
  //           defaultMessage="Subscribe to alerts"
  //         />
  //       </a>,
  //     ],
  //   },
  // ];
  const columns: ProColumns<API.InterfaceInfo>[] = [
    {
      title: <FormattedMessage id="pages.interfaceTable.id" defaultMessage="ID" />,
      dataIndex: 'id',
      valueType: 'index',
    },
    {
      title: <FormattedMessage id="pages.interfaceTable.name" defaultMessage="Interface Name" />,
      dataIndex: 'name',
      valueType: 'text',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '请输入接口名称',
          },
        ],
      },
      render: (dom, entity) => {
        return (
          <a
            onClick={() => {
              setCurrentRow(entity);
              setShowDetail(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: (
        <FormattedMessage id="pages.interfaceTable.description" defaultMessage="Description" />
      ),
      dataIndex: 'description',
      valueType: 'textarea',
    },
    {
      title: <FormattedMessage id="pages.interfaceTable.method" defaultMessage="Request Method" />,
      dataIndex: 'method',
      valueType: 'text',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '请输入请求方法',
          },
        ],
      },
    },
    {
      title: <FormattedMessage id="pages.interfaceTable.url" defaultMessage="URL" />,
      dataIndex: 'url',
      valueType: 'text',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '请输入URL',
          },
        ],
      },
    },
    {
      title: (
        <FormattedMessage id="pages.interfaceTable.requestHeader" defaultMessage="Request Header" />
      ),
      dataIndex: 'requestHeader',
      valueType: 'jsonCode',
    },
    {
      title: (
        <FormattedMessage id="pages.interfaceTable.requestParams" defaultMessage="Request Params" />
      ),
      dataIndex: 'requestParams',
      valueType: 'jsonCode',
    },
    {
      title: (
        <FormattedMessage
          id="pages.interfaceTable.responseHeader"
          defaultMessage="Response Header"
        />
      ),
      dataIndex: 'responseHeader',
      valueType: 'jsonCode',
    },
    {
      title: <FormattedMessage id="pages.interfaceTable.status" defaultMessage="Status" />,
      dataIndex: 'status',
      hideInForm: true,
      valueEnum: {
        0: {
          text: (
            <FormattedMessage id="pages.interfaceTable.status.off" defaultMessage="Shut down" />
          ),
          status: 'Default',
        },
        1: {
          text: (
            <FormattedMessage id="pages.searchTable.nameStatus.running" defaultMessage="Running" />
          ),
          status: 'Processing',
        },
      },
    },
    {
      title: (
        <FormattedMessage id="pages.interfaceTable.createTime" defaultMessage="Creation Time" />
      ),
      dataIndex: 'createTime',
      valueType: 'dateTime',
      hideInForm: true,
    },
    {
      title: <FormattedMessage id="pages.interfaceTable.updateTime" defaultMessage="Update Time" />,
      dataIndex: 'updateTime',
      valueType: 'dateTime',
      hideInForm: true,
    },
    {
      title: <FormattedMessage id="pages.interfaceTable.option" defaultMessage="Operation" />,
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => [
        // 修改按钮
        <a
          key="config"
          onClick={() => {
            // handleUpdateModalOpen(true);
            // 这里打开 UpdateForm 而不是 CreateModal
            handleUpdateModalOpen(true);
            setCurrentRow(record);
          }}
        >
          <FormattedMessage id="pages.interfaceTable.config" defaultMessage="Configure" />
        </a>,
        // 根据状态渲染上线或下线按钮
        record.status === 0 ? (
          <a
            key="start"
            style={{ color: 'green' }}
            onClick={async () => {
              const success = await handleOnline(record);
              if (success) {
                actionRef.current?.reload();
              }
            }}
          >
            <FormattedMessage id="pages.interfaceTable.online" defaultMessage="上线" />
          </a>
        ) : (
          <a
            key="stop"
            style={{ color: 'orange' }}
            onClick={async () => {
              const success = await handleOffline(record);
              if (success) {
                actionRef.current?.reload();
              }
            }}
          >
            <FormattedMessage id="pages.interfaceTable.offline" defaultMessage="下线" />
          </a>
        ),
        // 订阅警报
        <a key="subscribeAlert" href="https://procomponents.ant.design/">
          <FormattedMessage
            id="pages.interfaceTable.subscribeAlert"
            defaultMessage="Subscribe to Alerts"
          />
        </a>,
        // 删除按钮
        <a
          key="delete"
          style={{ color: 'red' }} // 设置删除按钮的样式
          onClick={async () => {
            const success = await handleRemove(record); // 调用删除函数
            if (success) {
              actionRef.current?.reload(); // 成功后刷新表格
            }
          }}
        >
          <FormattedMessage id="pages.interfaceTable.delete" defaultMessage="删除" />
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.RuleListItem, API.PageParams>
        headerTitle={intl.formatMessage({
          id: 'pages.searchTable.title',
          defaultMessage: 'Enquiry form',
        })}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalOpen(true);
            }}
          >
            <PlusOutlined /> <FormattedMessage id="pages.searchTable.new" defaultMessage="New" />
          </Button>,
        ]}
        // request={listInterfaceInfoUsingGet}
        // 分页查询
        request={async (
          params: {
            pageSize?: number;
            current?: number;
            keyword?: string;
          },
          // sort: Record<string, SortOrder>,
          // filter: Record<string, (string | number)[] | null>,
        ) => {
          const res = await listInterfaceInfoByPageUsingGet({
            ...params,
          } as API.listInterfaceInfoByPageUsingGETParams);

          if (res.data) {
            return {
              data: res.data.records || [],
              success: true,
              total: res.data.total,
            };
          } else {
            return {
              data: [],
              success: false,
              total: 0,
            };
          }
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" />{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              <FormattedMessage id="pages.searchTable.item" defaultMessage="项" />
              &nbsp;&nbsp;
              <span>
                <FormattedMessage
                  id="pages.searchTable.totalServiceCalls"
                  defaultMessage="Total number of service calls"
                />{' '}
                {selectedRowsState.reduce((pre, item) => pre + item.callNo!, 0)}{' '}
                <FormattedMessage id="pages.searchTable.tenThousand" defaultMessage="万" />
              </span>
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            <FormattedMessage
              id="pages.searchTable.batchDeletion"
              defaultMessage="Batch deletion"
            />
          </Button>
          <Button type="primary">
            <FormattedMessage
              id="pages.searchTable.batchApproval"
              defaultMessage="Batch approval"
            />
          </Button>
        </FooterToolbar>
      )}
      <ModalForm
        title={intl.formatMessage({
          id: 'pages.searchTable.createForm.newRule',
          defaultMessage: 'New rule',
        })}
        width="400px"
        open={createModalOpen}
        onOpenChange={handleModalOpen}
        onFinish={async (value) => {
          const success = await handleAdd(value);
          if (success) {
            handleModalOpen(false);
            if (actionRef.current) {
              actionRef.current?.reload();
            }
          }
        }}
      >
        <ProFormText
          rules={[
            {
              required: true,
              message: (
                <FormattedMessage
                  id="pages.searchTable.ruleName"
                  defaultMessage="Rule name is required"
                />
              ),
            },
          ]}
          width="md"
          name="name"
        />
        <ProFormTextArea width="md" name="desc" />
      </ModalForm>

      <UpdateModal
        /* 这里的 UpdateModal 代码是在原有的 UpdateForm 基础上面改的 */
        columns={columns}
        value={currentRow || {}}
        open={updateModalOpen}
        onSubmit={async (value) => {
          const success = await handleUpdate(value);
          if (success) {
            handleUpdateModalOpen(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current?.reload();
            }
          }
        }}
        onCancel={() => {
          handleUpdateModalOpen(false);
          if (!showDetail) {
            setCurrentRow(undefined);
          }
        }}
      />

      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<API.RuleListItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<API.RuleListItem>[]}
          />
        )}
      </Drawer>
      <CreateModal
        columns={columns}
        open={createModalOpen}
        onCancel={() => {
          handleModalOpen(false);
        }}
        onSubmit={(values) => {
          // 提交处理逻辑
          handleAdd(values);
        }}
      />
    </PageContainer>
  );
};

export default TableList;
