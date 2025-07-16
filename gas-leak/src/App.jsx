import React, { useState } from 'react';
import { Upload, Button, Progress, message, Typography, Space } from 'antd';
import { UploadOutlined, PlayCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

function App() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [processedUrl, setProcessedUrl] = useState('');

  const handleBeforeUpload = (file) => {
    setFile(file);
    setVideoUrl(URL.createObjectURL(file));
    return false; // предотвратить авто-загрузку
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

  return (
    <div style={{ maxWidth: 600, margin: '50px auto', padding: 24 }}>
      <Title level={2}>Анализ утечек газа на видео</Title>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Upload
          beforeUpload={handleBeforeUpload}
          accept="video/*"
          maxCount={1}
          showUploadList={{ showPreviewIcon: false }}
        >
          <Button icon={<UploadOutlined />}>Выберите видео</Button>
        </Upload>

        {videoUrl && (
          <video
            src={videoUrl}
            controls
            style={{ width: '100%', borderRadius: 8, border: '1px solid #ccc' }}
          />
        )}

        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          loading={uploading}
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          Отправить на анализ
        </Button>

        {uploading && <Progress percent={progress} />}

        {processedUrl && (
          <>
            <Title level={4}>Результат анализа:</Title>
            <video
              src={processedUrl}
              controls
              style={{ width: '100%', borderRadius: 8, border: '1px solid #ccc' }}
            />
          </>
        )}
      </Space>
    </div>
  );
}

export default App;
