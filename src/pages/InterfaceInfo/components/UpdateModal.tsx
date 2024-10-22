import { Modal } from 'antd';
import React, {useEffect, useRef} from 'react';
import { ProColumns, ProFormInstance, ProTable } from '@ant-design/pro-components';
import '@umijs/max';

export type Props = {
  value: API.InterfaceInfo;
  columns: ProColumns<API.InterfaceInfoUpdateRequest>[];
  onCancel: () => void;
  onSubmit: (values: API.InterfaceInfoUpdateRequest) => Promise<void>;
  open: boolean;
};

const UpdateModal: React.FC<Props> = (props) => {
  const { value, columns, open, onCancel, onSubmit } = props;

  const formRef = useRef<ProFormInstance>();

  useEffect(() => {
    if (formRef.current && value) {
      formRef.current?.setFieldsValue(value);
    }
  }, [value]);

  return (
    <Modal title={'更新接口'} footer={null} open={open} onCancel={() => onCancel?.()}>
      <ProTable
        columns={columns}
        formRef={formRef}
        type={'form'}
        onSubmit={async (value) => onSubmit?.(value as API.InterfaceInfoUpdateRequest)}
        // 设置默认值
        form={{ initialValues: value }}
      />
    </Modal>

  );
};

export default UpdateModal;
