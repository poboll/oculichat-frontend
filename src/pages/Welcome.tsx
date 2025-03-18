import { useModel } from '@umijs/max';
import { Card, theme, Typography } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams } from "@@/exports";
import GetGiftModal from "@/components/Gift/GetGift";
import { getUserByInvitationCodeUsingPOST } from "@/services/qiApi-backend/userController";

const { Text, Title } = Typography;

/**
 * 单个信息卡片组件，用于复用展示卡片样式
 * @param {Object} props - 组件属性
 * @param {string|JSX.Element} props.title - 卡片标题
 * @param {number} props.index - 卡片索引
 * @param {string|JSX.Element} props.desc - 卡片描述
 * @param {string} props.href - 链接地址（未使用）
 */
const InfoCard: React.FC<{
  title: any;
  index: number;
  desc: any;
  href: string;
}> = ({ title, index, desc }) => {
  const { useToken } = theme;
  const { token } = useToken();
  return (
    <div
      style={{
        backgroundColor: token.colorBgContainer,
        boxShadow: token.boxShadow,
        borderRadius: '8px',
        fontSize: '14px',
        color: token.colorTextSecondary,
        lineHeight: '22px',
        padding: '16px 19px',
        minWidth: '220px',
        flex: 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            lineHeight: '22px',
            backgroundSize: '100%',
            textAlign: 'center',
            padding: '8px 16px 16px 12px',
            color: '#FFF',
            fontWeight: 'bold',
            backgroundImage:
              "url('https://gw.alipayobjects.com/zos/bmw-prod/daaf8d50-8e6d-4251-905d-676a24ddfa12.svg')",
          }}
        >
          {index}
        </div>
        <div
          style={{
            fontSize: '16px',
            color: token.colorText,
            paddingBottom: 8,
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          fontSize: '14px',
          color: token.colorTextSecondary,
          textAlign: 'justify',
          lineHeight: '22px',
          marginBottom: 8,
        }}
      >
        {desc}
      </div>
      <br />
    </div>
  );
};

/**
 * 滚动展示组件
 * 左侧为文字描述区域（30%宽），右侧为图片展示区域（70%宽），图片根据左侧滚动缓慢切换
 */
const ScrollingShowcase: React.FC = () => {
  // 定义展示数据，包含标题、描述和图片链接（图片链接为你提供的四张设计图）
  const showcaseData = [
    {
      title: '设计方案一',
      description: '这是设计方案一的描述文本，详细说明了方案的特点和优势。',
      image: 'https://pic1.imgdb.cn/item/65708cafc458853aef9b426b.jpg',
    },
    {
      title: '设计方案二',
      description: '这是设计方案二的描述文本，详细说明了方案的特点和优势。',
      image: 'https://pic1.imgdb.cn/item/657084c7c458853aef76b008.jpg',
    },
    {
      title: '设计方案三',
      description: '这是设计方案三的描述文本，详细说明了方案的特点和优势。',
      image: 'https://pic1.imgdb.cn/item/657084c7c458853aef76af5d.jpg',
    },
    {
      title: '设计方案四',
      description: '这是设计方案四的描述文本，详细说明了方案的特点和优势。',
      image: 'https://pic1.imgdb.cn/item/65708348c458853aef70266b.jpg',
    },
  ];

  // 当前激活的展示项索引
  const [activeIndex, setActiveIndex] = useState(0);
  // 左侧滚动区域的引用
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 滚动事件处理函数，根据滚动位置计算当前激活的展示项
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollTop = container.scrollTop;
    const totalScrollHeight = container.scrollHeight - container.clientHeight;
    // 计算滚动进度（0到1之间的数值）
    const scrollProgress = scrollTop / totalScrollHeight;
    // 根据滚动进度计算当前索引
    let newIndex = Math.floor(scrollProgress * showcaseData.length);
    // 确保索引不会超出数组范围
    if (newIndex >= showcaseData.length) newIndex = showcaseData.length - 1;
    setActiveIndex(newIndex);
  };

  return (
    <div
      style={{
        display: 'flex',
        marginTop: 40,
        height: 400, // 整体组件高度，可根据需求调整
        border: '1px solid #f0f0f0',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {/* 左侧文字描述区域，宽度为30%，随着鼠标滚动上下滚动 */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{
          width: '30%',
          overflowY: 'auto',
          padding: '16px',
          boxSizing: 'border-box',
        }}
      >
        {showcaseData.map((item, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: 60,
              minHeight: 200,
            }}
          >
            <Title level={4}>{item.title}</Title>
            <Text>{item.description}</Text>
          </div>
        ))}
      </div>

      {/* 右侧图片展示区域，宽度为70%，图片淡入淡出缓慢切换 */}
      <div
        style={{
          width: '70%',
          position: 'relative',
        }}
      >
        {showcaseData.map((item, idx) => (
          <img
            key={idx}
            src={item.image}
            alt={item.title}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover', // 使用cover保持图片比例，填充整个区域
              transition: 'opacity 0.8s ease', // 淡入淡出过渡效果
              opacity: activeIndex === idx ? 1 : 0,
            }}
          />
        ))}
      </div>
    </div>
  );
};

const Welcome: React.FC = () => {
  const { token } = theme.useToken();
  const { initialState } = useModel('@@initialState');
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<API.UserVO>();
  const params = useParams();

  // 根据邀请码获取用户信息的异步函数
  const getUserByInvitationCode = async () => {
    const res = await getUserByInvitationCodeUsingPOST({ invitationCode: params.id });
    if (res.code === 0 && res.data) {
      // 若邀请码为自身邀请码，则不进行操作
      if (initialState?.loginUser && initialState?.loginUser.invitationCode === params.id) {
        return;
      }
      // 若用户未登录，则显示弹窗并设置数据
      if (!initialState?.loginUser) {
        setOpen(true);
        setData(res.data);
      }
    }
  };

  // 组件加载后根据参数获取用户信息
  useEffect(() => {
    if (params.id) {
      getUserByInvitationCode();
    }
  }, [params.id]);

  return (
    <>
      <Card
        style={{
          borderRadius: 8,
        }}
        bodyStyle={{
          backgroundImage:
            initialState?.settings?.navTheme === 'realDark'
              ? 'linear-gradient(75deg, #1A1B1F 0%, #191C1F 100%)'
              : 'linear-gradient(75deg, #FBFDFF 0%, #F5F7FF 100%)',
        }}
      >
        <div
          style={{
            backgroundPosition: '100% -30%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '274px auto',
            backgroundImage:
              "url('https://gw.alipayobjects.com/mdn/rms_a9745b/afts/img/A*BuFmQqsB2iAAAAAAAAAAAAAAARQnAQ')",
          }}
        >
          <div
            style={{
              fontSize: '20px',
              color: token.colorTextHeading,
            }}
          >
            <Title level={3}>欢迎使用 Oculichat 眼底智能影像分析平台 🎉</Title>
          </div>
          <div
            style={{
              fontSize: '14px',
              color: token.colorTextSecondary,
              lineHeight: '22px',
              marginTop: 16,
              marginBottom: 32,
              width: '100%',
            }}
          >
            <Text strong>
              <Title level={4}>Oculichat 眼底智能影像分析平台是一款为患者和医生提供眼底OCR辅助诊疗API接口调用服务的平台 🛠</Title>
              <Title level={5}>
                😀 作为用户，您可以通过注册登录账户获取接口调用权限，并根据自己的需求浏览和选择适合的接口。您可以在线进行接口调试，快速验证接口的功能和效果。
                <br />
                💻 作为开发者，我们提供了{' '}
                <a href="https://github.com/poboll/oculichat-sdk" target="_blank" rel="noreferrer">
                  客户端SDK
                </a>
                ，通过{' '}
                <Link to="/account/center">
                  开发者凭证
                </Link>{' '}
                即可轻松将接口集成到您的项目中，实现高效开发和调用。
                <br />
                🤝 您可以将自己的接口接入到 Oculichat 眼底智能影像分析平台，并发布给其他用户使用，便于管理和优化接口性能。
                <br />
                👌 我们还提供了{' '}
                <a href="https://api-docs.oculichat.com" target="_blank" rel="noreferrer">
                  开发者在线文档
                </a>{' '}
                和技术支持，帮助您快速接入和发布接口。
                <br />
                🏁 无论您是用户还是开发者，Oculichat 眼底智能影像分析平台致力于提供稳定、安全、高效的接口调用服务，帮助您实现便捷的开发和调用体验。
              </Title>
            </Text>
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <InfoCard
              index={1}
              href="https://api.oculichat.com/"
              title={<Title level={5}>多样化的接口选择</Title>}
              desc={<Text strong>平台提供丰富多样的接口选择，涵盖多种功能和服务，满足不同应用需求。</Text>}
            />
            <InfoCard
              index={2}
              href="https://api.oculichat.com/"
              title={<Title level={5}>在线调试功能</Title>}
              desc={<Text strong>您可在平台上进行接口在线调试，快速验证接口功能和效果，节省开发时间。</Text>}
            />
            <InfoCard
              index={3}
              href="https://api.oculichat.com/"
              title={<Title level={5}>客户端SDK支持</Title>}
              desc={<Text strong>为便于开发者集成接口，平台提供了完善的客户端SDK，使接口调用更加简单便捷。</Text>}
            />
            <InfoCard
              index={4}
              href="https://api.oculichat.com/"
              title={<Title level={5}>开发者文档与技术支持</Title>}
              desc={<Text strong>平台提供详细的开发者文档和专业的技术支持，助您快速接入并发布接口。</Text>}
            />
            <InfoCard
              index={5}
              href="https://api.oculichat.com/"
              title={<Title level={5}>稳定与安全</Title>}
              desc={<Text strong>平台致力于提供稳定、安全的接口服务，采用多重安全措施保障用户数据和隐私。</Text>}
            />
          </div>
        </div>
        <GetGiftModal data={data} onCancel={() => setOpen(false)} open={open} />
      </Card>

      {/* 在卡片下方添加滚动展示组件 */}
      <ScrollingShowcase />
    </>
  );
};

export default Welcome;
