import { useModel } from '@umijs/max';
import { Card, theme, Typography, Row, Col, Button } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams } from '@@/exports';
import GetGiftModal from '@/components/Gift/GetGift';
import { getUserByInvitationCodeUsingPOST } from '@/services/qiApi-backend/userController';
import Paragraph from 'antd/lib/typography/Paragraph';
// import "./index.css"; // 如果需要，你可自行引入 Tailwind CSS 等

const { Text, Title } = Typography;

/**
 * 单个信息卡片组件，用于复用展示卡片样式
 * @param {Object} props - 组件属性
 * @param {string|JSX.Element} props.title - 卡片标题
 * @param {number} props.index - 卡片索引
 * @param {string|JSX.Element} props.desc - 卡片描述
 * @param {string} props.href - 链接地址
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
    // 定义展示数据，包含标题、描述和图片链接
    const showcaseData = [
        {
            title: '眼底图像智能分析',
            description: '采用先进的深度学习技术，实现眼底图像的自动分析和病变检测，准确率达到业内领先水平。',
            image: 'http://www.cdnjson.com/images/2025/03/31/ocu00.png',
        },
        {
            title: '智能诊断报告',
            description: '针对医疗报告的专业OCR识别，支持多种格式的医疗文档，实现快速准确的文本提取。',
            image: 'http://www.cdnjson.com/images/2025/03/31/ocu1.png',
        },
        {
            title: '模型精确打分',
            description: '结合AI模型和专家经验，提供智能化的诊断建议，协助医生提高诊断效率。',
            image: 'http://www.cdnjson.com/images/2025/03/31/ocu2.png',
        },
        {
            title: '模型精确打分',
            description: '结合AI模型和专家经验，提供智能化的诊断建议，协助医生提高诊断效率。',
            image: 'http://www.cdnjson.com/images/2025/03/31/ocu3.png',
        },
        {
            title: '眼底图像示例',
            description: '强大的数据分析能力，帮助医疗机构深入理解患者数据，优化诊疗方案。',
            image: 'http://www.cdnjson.com/images/2025/03/31/ocu4.png',
        },
        {
            title: '先进算法支撑',
            description: '强大的数据分析能力，帮助医疗机构深入理解患者数据，优化诊疗方案。',
            image: 'http://www.cdnjson.com/images/2025/03/31/ocu6.png',
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
            {/* 左侧文字描述区域，宽度为30%，随着鼠标滚动上下滚动 */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                style={{
                    width: '30%',
                    overflowY: 'auto',
                    padding: '16px',
                    boxSizing: 'border-box',
                    /* 隐藏滚动条 */
                    scrollbarWidth: 'none', /* Firefox */
                    msOverflowStyle: 'none', /* IE/Edge */
                }}
            >
                {/* 添加自定义样式以隐藏WebKit浏览器的滚动条 */}
                <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
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

/**
 * 简易版手风琴组件，用于FAQ展示
 */
const SimpleAccordion: React.FC<{
    items: { question: string; answer: React.ReactNode }[];
}> = ({ items }) => {
    const { token } = theme.useToken();

    return (
        <div style={{ marginTop: 40 }}>
            {items.map((item, index) => (
                <div
                    key={index}
                    style={{
                        marginBottom: 16,
                        border: `1px solid ${token.colorBorderSecondary}`,
                        borderRadius: 8,
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            padding: '16px',
                            backgroundColor: token.colorBgContainer,
                            fontWeight: 500,
                            color: token.colorText,
                            cursor: 'pointer',
                        }}
                    >
                        {item.question}
                    </div>
                    <div
                        style={{
                            padding: '16px',
                            backgroundColor: token.colorBgContainer,
                            borderTop: `1px solid ${token.colorBorderSecondary}`,
                            color: token.colorTextSecondary,
                        }}
                    >
                        {item.answer}
                    </div>
                </div>
            ))}
        </div>
    );
};

/**
 * 眼科项目展示卡片
 */
const EyeProjectCard: React.FC<{
    title: string;
    children: React.ReactNode;
    imageUrl?: string;
}> = ({ title, children, imageUrl }) => {
    const { token } = theme.useToken();

    return (
        <div
            style={{
                backgroundColor: token.colorBgContainer,
                boxShadow: token.boxShadow,
                borderRadius: '8px',
                padding: '24px',
                position: 'relative',
                marginBottom: '24px',
                border: `1px solid ${token.colorBorderSecondary}`,
            }}
        >
            {imageUrl && (
                <div
                    style={{
                        position: 'absolute',
                        top: '-40px',
                        right: '-40px',
                        width: '112px',
                        height: 'auto',
                        backgroundImage: `url(${imageUrl})`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                    }}
                />
            )}
            <Title level={4} style={{ marginBottom: '16px', color: '#315167' }}>
                {title}
            </Title>
            {children}
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
        const res = await getUserByInvitationCodeUsingPOST({
            invitationCode: params.id,
        });
        if (res.code === 0 && res.data) {
            // 若邀请码为自身邀请码，则不进行操作
            if (
                initialState?.loginUser &&
                initialState?.loginUser.invitationCode === params.id
            ) {
                return;
            }
            // 若用户未登录，则显示弹窗并设置数据
            if (!initialState?.loginUser) {
                setOpen(true);
                setData(res.data);
            }
        }
    };

    // FAQs数据
    const faqItems = [
        {
            question: 'Q1: 该系统主要解决什么问题？',
            answer:
                '系统通过自动识别双目眼底图像中的病灶类型，大幅减轻医生的诊断压力，并实现高准确率的疾病分类与辅助诊断，适用于多种常见眼科疾病的快速筛查。',
        },
        {
            question: 'Q2: 系统在模型优化和诊断方面有哪些优势？',
            answer:
                '我们的系统采用精细优化的深度学习模型，结合模型诊断工具实时监控和调优，不仅在测试集上实现了准确率≥80%，精确率和召回率均达到或超过90%，同时支持大模型对接与后续跟进，确保临床应用中的高稳定性和高可靠性。',
        },
        {
            question: 'Q3: 系统在后端技术和接口优化上有哪些亮点？',
            answer: (
                <ul style={{ listStyleType: 'disc', marginLeft: '20px' }}>
                    <li>采用最新的 Spring Boot、Dubbo、Spring Cloud Gateway 等前沿技术栈</li>
                    <li>支持接口限流和高并发处理，确保稳定高效的服务响应</li>
                    <li>通过 API 签名认证和分布式登录保障系统安全</li>
                </ul>
            ),
        },
        {
            question: 'Q4: 如何与现有医疗信息系统对接？',
            answer:
                '系统支持 RESTful API 与 gRPC 接口，可无缝对接医院 HIS、PACS 等现有系统，并可封装成微服务或 Docker 容器，满足不同部署环境下的集成需求。',
        },
        {
            question: 'Q5: 系统是否支持跨平台部署？',
            answer:
                '是的。系统基于通用深度学习框架和现代后端架构，可部署于 Windows、Linux 等多种环境，同时支持云端服务器部署，满足不同业务场景的需求。',
        },
    ];

    // 组件加载后根据参数获取用户信息
    useEffect(() => {
        if (params.id) {
            getUserByInvitationCode();
        }
    }, [params.id]);

    return (
        <>
            {/* 新增：顶部首页式Hero区域 */}
            <section style={{
                position: 'relative',
                overflow: 'hidden',
                paddingTop: '80px',
                paddingBottom: '64px',
                backgroundColor: '#f8f9fa',
            }}>
                {/* 背景装饰元素 */}
                <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    zIndex: 0,
                    height: '100%',
                }}>
                    <img
                        src="/bg-line-right.svg"
                        alt="背景装饰"
                        style={{
                            height: '100%',
                            width: 'auto',
                        }}
                    />
                </div>

                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '0 24px',
                    position: 'relative',
                    zIndex: 10,
                }}>
                    <div style={{
                        maxWidth: '800px',
                        margin: '0 auto',
                        textAlign: 'center',
                        marginBottom: '48px',
                    }}>
                        <h1 style={{
                            fontSize: '42px',
                            fontWeight: 'bold',
                            color: '#315167',
                            marginBottom: '24px',
                            lineHeight: 1.2,
                        }}>
                            眼底智能影像分析平台，为医疗诊断赋能
                        </h1>
                        <p style={{
                            fontSize: '18px',
                            color: '#315167',
                            marginBottom: '40px',
                        }}>
                            Oculichat 是一款简单易用且精准的眼底医学影像处理和分析平台<br />
                            无需部署，即刻调用，精准诊断，隐私保护
                        </p>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            gap: '16px',
                            flexWrap: 'wrap',
                        }}>
                            <Button
                                type="primary"
                                size="large"
                                style={{
                                    borderRadius: '9999px',
                                    backgroundColor: '#315167',
                                    padding: '0 32px',
                                    height: '48px',
                                    fontSize: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Link to="/sign-up">立刻开始使用</Link>
                            </Button>
                            <Button
                                size="large"
                                style={{
                                    borderRadius: '9999px',
                                    borderColor: '#315167',
                                    color: '#315167',
                                    padding: '0 32px',
                                    height: '48px',
                                    fontSize: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Link to="/demo">查看在线演示</Link>
                            </Button>
                        </div>
                    </div>

                    <div style={{ marginTop: '48px', textAlign: 'center' }}>
                        <p style={{
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: '#98a1ab',
                            marginBottom: '24px',
                        }}>
                            领先业界的医用级辅助诊断平台
                        </p>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '32px',
                        }}>
                            {/* 可以替换为实际的合作伙伴 logo */}
                            <img
                                src="https://ext.same-assets.com/1522289765/1206454854.svg+xml"
                                alt="合作伙伴1"
                                style={{ height: '24px', width: 'auto', opacity: 0.6 }}
                            />
                            <img
                                src="https://ext.same-assets.com/4002675097/3040921684.svg+xml"
                                alt="合作伙伴2"
                                style={{ height: '24px', width: 'auto', opacity: 0.6 }}
                            />
                            <img
                                src="https://ext.same-assets.com/2934092563/3407460363.svg+xml"
                                alt="合作伙伴3"
                                style={{ height: '24px', width: 'auto', opacity: 0.6 }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 欢迎信息卡片 */}
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
                        <Title level={3}>
                            欢迎使用 Oculichat 眼底智能影像分析平台 🎉
                        </Title>
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
                            <Title level={4}>
                                Oculichat 眼底智能影像分析平台是一款为患者和医生提供眼底OCR辅助诊疗API接口调用服务的平台
                                🛠
                            </Title>
                            <Title level={5}>
                                😀 作为用户，您可以通过注册登录账户获取接口调用权限，并根据自己的需求浏览和选择适合的接口。您可以在线进行接口调试，快速验证接口的功能和效果。
                                <br />
                                💻 作为开发者，我们提供了{' '}
                                <a
                                    href="https://github.com/poboll/oculichat-sdk"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    客户端SDK
                                </a>
                                ，通过 <Link to="/account/center">开发者凭证</Link>
                                即可轻松将接口集成到您的项目中，实现高效开发和调用。
                                <br />
                                🤝 您可以将自己的接口接入到 Oculichat 眼底智能影像分析平台，并发布给其他用户使用，便于管理和优化接口性能。
                                <br />
                                👌 我们还提供了{' '}
                                <a
                                    href="https://api-docs.oculichat.com"
                                    target="_blank"
                                    rel="noreferrer"
                                >
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
                            desc={
                                <Text strong>
                                    平台提供丰富多样的接口选择，涵盖多种功能和服务，满足不同应用需求。
                                </Text>
                            }
                        />
                        <InfoCard
                            index={2}
                            href="https://api.oculichat.com/"
                            title={<Title level={5}>在线调试功能</Title>}
                            desc={
                                <Text strong>
                                    您可在平台上进行接口在线调试，快速验证接口功能和效果，节省开发时间。
                                </Text>
                            }
                        />
                        <InfoCard
                            index={3}
                            href="https://api.oculichat.com/"
                            title={<Title level={5}>客户端SDK支持</Title>}
                            desc={
                                <Text strong>
                                    为便于开发者集成接口，平台提供了完善的客户端SDK，使接口调用更加简单便捷。
                                </Text>
                            }
                        />
                        <InfoCard
                            index={4}
                            href="https://api.oculichat.com/"
                            title={<Title level={5}>开发者文档与技术支持</Title>}
                            desc={
                                <Text strong>
                                    平台提供详细的开发者文档和专业的技术支持，助您快速接入并发布接口。
                                </Text>
                            }
                        />
                        <InfoCard
                            index={5}
                            href="https://api.oculichat.com/"
                            title={<Title level={5}>稳定与安全</Title>}
                            desc={
                                <Text strong>
                                    平台致力于提供稳定、准确、安全的眼底OCR图像辅助诊断和对外的API接口服务，采用多重安全措施保障用户数据和隐私。
                                </Text>
                            }
                        />
                    </div>
                </div>
                <GetGiftModal data={data} onCancel={() => setOpen(false)} open={open} />
            </Card>

            {/* 滚动展示组件 */}
            <ScrollingShowcase />

            {/* 眼科项目内容区域 */}
            <Card
                style={{
                    borderRadius: 8,
                    marginTop: 40,
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <Title level={2} style={{ color: '#315167' }}>
                        基于眼底医学影像的眼科疾病智能诊断系统
                    </Title>
                    <Text style={{ fontSize: 16, color: '#315167' }}>
                        通过深度学习与医学图像处理技术，系统实现高准确率的疾病诊断，
                        同时支持模型诊断、大模型对接及后续跟进，后端采用前沿技术栈，支持接口限流和系统高效优化。
                    </Text>
                </div>

                <Row gutter={24}>
                    <Col xs={24} md={12}>
                        {/* 左侧：项目背景 */}
                        <EyeProjectCard title="1. 命题方向 & 2. 题目类别">
                            <p style={{ color: '#315167', marginBottom: 16 }}>
                                <strong>命题方向：</strong>智能计算
                                <br />
                                <strong>题目类别：</strong>应用类
                            </p>

                            <Title level={4} style={{ color: '#315167', marginBottom: 16 }}>
                                3. 题目名称
                            </Title>
                            <p style={{ color: '#315167', marginBottom: 24 }}>
                                <strong>基于眼底医学影像的眼科疾病智能诊断系统</strong>
                            </p>

                            <Title level={4} style={{ color: '#315167', marginBottom: 16 }}>
                                4. 背景说明
                            </Title>
                            <p style={{ color: '#315167', marginBottom: 16 }}>
                                眼科疾病已成为继肿瘤和心脑血管疾病之后，对人类健康及生活质量构成重大威胁的疾病。
                                随着人口老龄化加剧、医疗资源分配不均，一线医生工作压力剧增，传统诊断手段已难以满足高效筛查需求。
                            </p>
                            <p style={{ color: '#315167', marginBottom: 16 }}>
                                为此，我们提出了一套智能诊断系统，利用经过精细优化的深度学习模型实现高准确率的自动诊断，
                                同时支持模型诊断、大模型对接与后续跟进，通过最新后端技术栈实现接口限流和系统性能优化，确保在大流量情况下依然高效稳定。
                            </p>
                            <p style={{ color: '#315167' }}>
                                <strong>企业背景（示例）：</strong>
                                <br />
                                诚迈科技（南京）股份有限公司专注于操作系统研发与数字医疗领域布局，致力于利用前沿技术为医疗机构提供智能、精准的辅助诊断工具。
                            </p>
                        </EyeProjectCard>
                    </Col>

                    <Col xs={24} md={12}>
                        {/* 右侧：项目说明 */}
                        <EyeProjectCard
                            title="5. 项目说明"
                            imageUrl="https://ext.same-assets.com/1160751423/849522504.png"
                        >
                            <p style={{ color: '#315167', marginBottom: 24 }}>
                                <strong>问题说明：</strong>
                                <br />
                                本项目旨在利用先进的深度学习技术，对双目彩色眼底图像中的病灶进行自动识别和分类，
                                针对糖尿病、青光眼、白内障、AMD、高血压、近视及其他异常情况（共8类）实现精准诊断。
                                <br />
                                <br />
                                <strong>用户期望：</strong>
                                <br />
                                1. 对2000+个双目彩色眼底图像进行统一预处理，解决亮度不均衡、噪声干扰等问题；
                                <br />
                                2. 采用经过优化的深度学习模型，在测试集上实现准确率≥80%，精确率和召回率均≥90%的优异表现；
                                <br />
                                3. 支持模型诊断、大模型对接及后续服务跟进，并对系统进行优化、接口限流保障高并发调用；
                                <br />
                                4. 后端采用最新技术栈，确保系统高性能与高可用性。
                            </p>

                            <div style={{ marginBottom: 24 }}>
                                <Title level={4} style={{ color: '#315167', marginBottom: 16 }}>
                                    6. 任务要求
                                </Title>
                                <ul
                                    style={{
                                        color: '#315167',
                                        listStyleType: 'disc',
                                        paddingLeft: 20,
                                    }}
                                >
                                    <li style={{ marginBottom: 8 }}>
                                        数据预处理：对原始双目眼底图像进行去噪、配准、亮度均衡等处理，确保数据质量。
                                    </li>
                                    <li style={{ marginBottom: 8 }}>
                                        模型设计：基于 PyTorch/TensorFlow 构建多分类深度学习模型，并进行针对性优化，确保高准确率。
                                    </li>
                                    <li style={{ marginBottom: 8 }}>
                                        模型诊断与优化：提供模型诊断工具，实时监控模型表现，支持大模型对接及后续跟进服务。
                                    </li>
                                    <li>
                                        系统整合：实现从图像输入、模型推理、结果可视化到接口限流、后端高性能支持的完整流程。
                                    </li>
                                </ul>
                            </div>

                            <button
                                onClick={() => window.open('https://www.yuque.com/inni/item/oculichat', '_blank')}
                                style={{
                                    width: '100%',
                                    padding: '12px 0',
                                    textAlign: 'center',
                                    backgroundColor: '#315167',
                                    color: 'white',
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    border: 'none',  // 移除按钮边框
                                    fontFamily: 'inherit',  // 继承父元素字体
                                    fontSize: 'inherit',  // 继承父元素字体大小
                                }}
                            >
                                查看项目更多详情
                            </button>

                        </EyeProjectCard>
                    </Col>
                </Row>

                {/* 合作伙伴/成果展示 */}
                <div style={{ marginTop: 60, marginBottom: 40 }}>
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <Text
                            style={{
                                fontSize: 12,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                color: '#98a1ab',
                            }}
                        >
                            7. 其他 &amp; 8. 参考信息
                        </Text>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 32,
                        }}
                    >
                        {/* 这里使用了一些占位图片，模拟合作伙伴logo */}
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <div
                                key={item}
                                style={{
                                    height: 24,
                                    width: 130,
                                    backgroundColor: '#f0f0f0',
                                    opacity: 0.6,
                                    borderRadius: 4,
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* FAQ部分 */}
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <Title
                        level={3}
                        style={{ textAlign: 'center', marginBottom: 40, color: '#315167' }}
                    >
                        9. 常见问题 &amp; 评分要点
                    </Title>

                    <SimpleAccordion items={faqItems} />
                </div>
            </Card>

            {/* 底部大按钮区（带背景图片） */}
            <section
                style={{
                    position: 'relative',
                    padding: '64px 0',
                    overflow: 'hidden',
                    backgroundColor: '#f8f9fa',
                    marginTop: '60px'
                }}
            >
                {/* 背景图片作为整个section的背景，不再限制在一个div中 */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 0,
                        backgroundImage: 'url("https://ext.same-assets.com/3908991051/849522504.png")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center bottom',
                        opacity: 0.15,
                        filter: 'blur(1px)'
                    }}
                />

                <div style={{ position: 'relative', zIndex: 10, maxWidth: '768px', margin: '0 auto', textAlign: 'center' }}>
                    <Title level={2} style={{ color: '#315167', marginBottom: '24px' }}>
                        开启智能眼科诊断新时代
                    </Title>
                    <Paragraph style={{ fontSize: '18px', color: '#315167', marginBottom: '40px' }}>
                        立即体验我们的眼底医学影像OCR开放平台，享受免费3000次API调用额度。专业版每月仅需￥999起。
                    </Paragraph>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            gap: '16px',
                            flexWrap: 'wrap'
                        }}
                    >
                        <Button
                            type="primary"
                            size="large"
                            style={{
                                borderRadius: '9999px',
                                backgroundColor: '#315167',
                                padding: '0 32px',
                                height: '48px',
                                fontSize: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 4px 14px rgba(49, 81, 103, 0.25)'
                            }}
                        >
                            <Link to="/sign-up">免费开始使用</Link>
                        </Button>
                        <Button
                            size="large"
                            style={{
                                borderRadius: '9999px',
                                borderColor: '#315167',
                                color: '#315167',
                                padding: '0 32px',
                                height: '48px',
                                fontSize: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Link to="/demo">查看API文档</Link>
                        </Button>
                    </div>
                    <Paragraph style={{ fontSize: '14px', color: '#315167', marginTop: '32px' }}>
                        安全可靠的医疗级API服务
                    </Paragraph>
                </div>
            </section>

            {/* 优化后的 Footer 样式 */}
            <footer style={{
                backgroundColor: '#fbfbf5',
                padding: '64px 0 40px',
                borderTop: '1px solid #e5e5e0'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '40px'
                    }}>
                        {/* 第一列：Logo与简单介绍 */}
                        <div style={{ gridColumn: 'span 2' }}>
                            <Link to="/" style={{ display: 'inline-block', marginBottom: '16px' }}>
                                <img
                                    src="/logo.svg"
                                    alt="Seline"
                                    width={94}
                                    height={32}
                                    style={{ display: 'inline-block' }}
                                />
                            </Link>
                            <p style={{ color: '#315167', fontSize: '14px', marginBottom: '8px' }}>Made and hosted in poboll.</p>
                            <p style={{ color: '#315167', fontSize: '14px', marginBottom: '24px' }}>Oculichat 眼底辅助诊断开放平台 © 2025.</p>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                {/* GitHub SVG 图标 */}
                                <a
                                    href="https://github.com/poboll/oculichat-frontend"
                                    style={{ color: '#315167' }}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                                        <path d="M9 18c-4.51 2-5-2-7-2"></path>
                                    </svg>
                                    <span style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: '0' }}>GitHub</span>
                                </a>
                                {/* Twitter SVG 图标 */}
                                <a
                                    href="https://x.com/poboll"
                                    style={{ color: '#315167' }}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                                    </svg>
                                    <span style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: '0' }}>Twitter</span>
                                </a>
                                {/* LinkedIn SVG 图标 */}
                                <a
                                    href="https://linkedin.com/company/caiths"
                                    style={{ color: '#315167' }}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                                        <rect x="2" y="9" width="4" height="12"></rect>
                                        <circle cx="4" cy="4" r="2"></circle>
                                    </svg>
                                    <span style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', borderWidth: '0' }}>LinkedIn</span>
                                </a>
                            </div>
                        </div>

                        {/* 第二列：Product */}
                        <div>
                            <h3 style={{ fontWeight: 500, color: '#315167', marginBottom: '16px', fontSize: '16px' }}>Product</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <li style={{ marginBottom: '12px' }}>
                                    <Link to="/pricing" style={{ color: '#315167', fontSize: '14px', textDecoration: 'none' }}>
                                        Pricing
                                    </Link>
                                </li>
                                <li style={{ marginBottom: '12px' }}>
                                    <Link to="/docs" style={{ color: '#315167', fontSize: '14px', textDecoration: 'none' }}>
                                        Docs
                                    </Link>
                                </li>
                                <li style={{ marginBottom: '12px' }}>
                                    <Link to="/affiliates" style={{ color: '#315167', fontSize: '14px', textDecoration: 'none' }}>
                                        Affiliates
                                    </Link>
                                </li>
                                <li style={{ marginBottom: '12px' }}>
                                    <Link to="/status" style={{ color: '#315167', fontSize: '14px', textDecoration: 'none' }}>
                                        Status page
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* 第三列：Company / Compare */}
                        <div>
                            <div style={{ marginBottom: '32px' }}>
                                <h3 style={{ fontWeight: 500, color: '#315167', marginBottom: '16px', fontSize: '16px' }}>Organization 组织</h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    <li style={{ marginBottom: '12px' }}>
                                        <Link to="/about-us" style={{ color: '#315167', fontSize: '14px', textDecoration: 'none' }}>
                                            About 关于我们
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 style={{ fontWeight: 500, color: '#315167', marginBottom: '16px', fontSize: '16px' }}>Compare 比较</h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    <li style={{ marginBottom: '12px' }}>
                                        <Link
                                            to="/seline-vs-google-analytics"
                                            style={{ color: '#315167', fontSize: '14px', textDecoration: 'none' }}
                                        >
                                            vs Tencent AIMIS
                                            <br></br>
                                            对比腾讯觅影·数智医疗影像平台
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* 第四列：Resources / Contact us */}
                        <div>
                            <div style={{ marginBottom: '32px' }}>
                                <h3 style={{ fontWeight: 500, color: '#315167', marginBottom: '16px', fontSize: '16px' }}>Resources 资源</h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    <li style={{ marginBottom: '12px' }}>
                                        <Link to="/blog" style={{ color: '#315167', fontSize: '14px', textDecoration: 'none' }}>
                                            Blog 博客
                                        </Link>
                                    </li>
                                    <li style={{ marginBottom: '12px' }}>
                                        <Link
                                            to="/google-analytics-terms"
                                            style={{ color: '#315167', fontSize: '14px', textDecoration: 'none' }}
                                        >
                                            Terms & definitions 术语与定义
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 style={{ fontWeight: 500, color: '#315167', marginBottom: '16px', fontSize: '16px' }}>Contact us 联系我们</h3>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    <li style={{ marginBottom: '12px' }}>
                                        <a
                                            href="mailto:caiths@icloud.com"
                                            style={{ color: '#315167', fontSize: '14px', textDecoration: 'none' }}
                                        >
                                            <span>Mail 邮件</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                            </svg>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* 第五列：Legal */}
                        <div>
                            <h3 style={{ fontWeight: 500, color: '#315167', marginBottom: '16px', fontSize: '16px' }}>Legal 法律与条款</h3>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                <li style={{ marginBottom: '12px' }}>
                                    <Link to="/privacy" style={{ color: '#315167', fontSize: '14px', textDecoration: 'none' }}>
                                        Privacy 隐私保护
                                    </Link>
                                </li>
                                <li style={{ marginBottom: '12px' }}>
                                    <Link to="/imprint" style={{ color: '#315167', fontSize: '14px', textDecoration: 'none' }}>
                                        Imprint 版权信息
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default Welcome;
