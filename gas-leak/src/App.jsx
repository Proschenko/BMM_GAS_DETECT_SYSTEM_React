import React, { useState } from 'react';
import {
  Upload,
  Button,
  Progress,
  message,
  Typography,
  Space,
  Card,
  Divider,
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
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [processedUrl, setProcessedUrl] = useState('');

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
    setProgress(0);
    setProcessedUrl('');

    try {
      const response = await axios.post('http://localhost:8000/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (e.total) {
            const percent = Math.round((e.loaded * 100) / e.total);
            setProgress(percent);
          }
        },
      });

      if (response.data.status === 'success') {
        setProcessedUrl(`http://localhost:8000${response.data.output_video}`);
        message.success('Видео успешно обработано!');
      } else {
        message.error('Ошибка обработки видео.');
      }
    } catch (error) {
      console.error(error);
      message.error('Ошибка при отправке запроса.');
    } finally {
      setUploading(false);
    }
  };

  const videoStyle = {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'contain',
    borderRadius: 8,
    border: '1px solid #ccc',
  };

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
            loading={uploading}
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            Отправить на анализ
          </Button>

          {uploading && (
            <Progress
              percent={progress}
              style={{ marginTop: 16 }}
              status={progress === 100 ? 'active' : 'normal'}
            />
          )}
        </Card>

        {processedUrl && (
          <Card bordered>
            <Title level={4}>
              <CheckCircleOutlined style={{ marginRight: 8, color: '#52c41a' }} />
              Результат анализа
            </Title>
            <video src={processedUrl} controls style={videoStyle} />
          </Card>
        )}
      </Space>
    </div>
  );
}

export default App;
