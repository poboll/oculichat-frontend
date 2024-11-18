import { listTopInvokeInterfaceInfoUsingGet } from '@/services/cai-api-backend/analysisController';
import { PageContainer } from '@ant-design/pro-components';
import ReactECharts from 'echarts-for-react';
import React, { useEffect, useState } from 'react';

/**
 * 接口分析
 * @constructor
 */
const InterfaceAnalysis: React.FC = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // openapi生成后端接口、从远程获取数据
    listTopInvokeInterfaceInfoUsingGet().then((res) => {
      if (res.data) {
        setData(res.data);
        setLoading(false);
      }
    });
  }, []);

  // 映射：{ value: 1048, name: 'Search Engine' },
  const chartInterface = data.map((item) => {
    return {
      value: item.invokeNum,
      name: item.name,
    };
  });

  const option = {
    title: {
      text: '调用次数最多的接口Top3',
      subtext: 'Fake Data',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
    },
    series: [
      {
        name: 'Access From',
        type: 'pie',
        radius: '50%',
        data: chartInterface,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };
  return (
    <PageContainer title={'接口调用情况'}>
      <ReactECharts
        loadingOption={{
          showLoading: loading,
        }}
        option={option}
      />
    </PageContainer>
  );
};

export default InterfaceAnalysis;
