import React, { useState, useRef } from 'react';
import {
  Upload,
  Button,
  Progress,
  message,
  Typography,
  Space,
  Card,
  Divider,
  Table,
} from 'antd';
import {
  UploadOutlined,
  PlayCircleOutlined,
  VideoCameraOutlined,
  FireOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import axios from 'axios';


const { Title, Text } = Typography;

function App() {
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [processedUrl, setProcessedUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [events, setEvents] = useState([]);
  const [detections, setDetections] = useState([]);

  const videoRef = useRef(null);

  const handleBeforeUpload = (file) => {
    setFile(file);
    setVideoUrl(URL.createObjectURL(file));
    return false;
  };

  const handleUpload = async () => {
    if (!file) {
      message.error('Сначала выберите видеофайл');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setUploadProgress(0);
    setProcessedUrl('');
    setEvents([]);
    setDetections([]);

    try {
      const response = await axios.post('http://localhost:8000/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) {
            const percent = Math.round((e.loaded * 100) / e.total);
            setUploadProgress(percent);
          }
        },
      });

      setUploading(false);
      setProcessing(true);

      const { data } = response;
      if (data.status === 'success') {
        setProcessedUrl(`http://localhost:8000${data.output_video}`);
        setEvents(data.events || []);
        setDetections(data.detections || []);
        message.success('Видео успешно обработано!');
      } else {
        message.error('Ошибка обработки видео.');
      }
    } catch (error) {
      console.error(error);
      message.error('Ошибка при отправке запроса.');
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  const videoStyle = {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'contain',
    borderRadius: 8,
    border: '1px solid #ccc',
  };

  const handleSeek = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

  const columns = [
    {
      title: 'Начало (с)',
      dataIndex: 'start',
      key: 'start',
      render: (val) => val.toFixed(2),
    },
    {
      title: 'Конец (с)',
      dataIndex: 'end',
      key: 'end',
      render: (val) => val.toFixed(2),
    },
    {
      title: 'Длительность (с)',
      dataIndex: 'duration',
      key: 'duration',
      render: (val) => val.toFixed(2),
    },
    {
      title: 'Действие',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => handleSeek(record.start)}>
          Перейти
        </Button>
      ),
    },
  ];

  return (
    <div
      style={{
        maxWidth: 800,
        margin: '40px auto',
        padding: 24,
        background: '#fafafa',
        borderRadius: 16,
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      }}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2} style={{ textAlign: 'center' }}>
          <FireOutlined style={{ color: '#f5222d', marginRight: 12 }} />
          Газ Лайтинг — Обнаружение утечек на видео
        </Title>

        <Card bordered>
          <Title level={4}>
            <VideoCameraOutlined style={{ marginRight: 8 }} />
            Шаг 1. Загрузите видео
          </Title>

          <Upload
            beforeUpload={handleBeforeUpload}
            accept="video/*"
            maxCount={1}
            showUploadList={{ showPreviewIcon: false }}
          >
            <Button icon={<UploadOutlined />}>Выберите видео</Button>
          </Upload>

          {videoUrl && (
            <>
              <Divider>Предпросмотр видео</Divider>
              <video src={videoUrl} controls style={videoStyle} />
            </>
          )}
        </Card>

        <Card bordered>
          <Title level={4}>
            <PlayCircleOutlined style={{ marginRight: 8 }} />
            Шаг 2. Запустите анализ
          </Title>

          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            loading={uploading || processing}
            onClick={handleUpload}
            disabled={!file || uploading || processing}
          >
            Отправить на анализ
          </Button>

          {uploading && (
            <Progress
              percent={uploadProgress}
              style={{ marginTop: 16 }}
              status={uploadProgress === 100 ? 'active' : 'normal'}
            />
          )}

          {processing && (
            <div style={{ marginTop: 16 }}>
              <Text>Идёт обработка видео...</Text>
              <Progress percent={100} status="active" showInfo={false} />
            </div>
          )}
        </Card>

        {processedUrl && (
          <Card bordered>
            <Title level={4}>
              <CheckCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
              Результат анализа
            </Title>
            <video
              ref={videoRef}
              src={processedUrl}
              controls
              style={videoStyle}
            />
          </Card>
        )}

        {events.length > 0 && (
          <Card bordered>
            <Title level={4}>Таблица утечек</Title>
            <Table
              dataSource={events}
              columns={columns}
              rowKey={(record, index) => index}
              pagination={false}
            />
          </Card>
        )}
      </Space>
    </div>
  );
}

export default App;
