import React, { useState, useRef, useEffect } from 'react';
import '@tensorflow/tfjs-backend-webgl';
import { Pose, POSE_LANDMARKS_LEFT, NormalizedLandmarkList, Results } from '@mediapipe/pose';
import AudioNotification from "../assets/audio/sound_notification.mp3";

interface Keypoint {
  frameID: number;
  leftHip: [number, number];
  leftKnee: [number, number];
  leftAnkle: [number, number];
  angle: number;
}

const VideoProcessor: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [keypoints, setKeypoints] = useState<Keypoint[]>([]);
  const [csvUrl, setCsvUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [csvFileName, setCsvFileName] = useState<string>('pose_data.csv');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const calculateAngle = (a: [number, number], b: [number, number], c: [number, number]): number => {
    const angle = Math.abs(
      Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(a[1] - b[1], a[0] - b[0])
    );
    return angle > Math.PI ? 2 * Math.PI - angle : angle;
  };

  const drawKeypoints = (ctx: CanvasRenderingContext2D, keypoints: Keypoint) => {
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;

    const drawPoint = ([x, y]: [number, number]) => {
      ctx.beginPath();
      ctx.arc(x * ctx.canvas.width, y * ctx.canvas.height, 5, 0, 2 * Math.PI);
      ctx.fill();
    };

    const drawLine = (start: [number, number], end: [number, number]) => {
      ctx.beginPath();
      ctx.moveTo(start[0] * ctx.canvas.width, start[1] * ctx.canvas.height);
      ctx.lineTo(end[0] * ctx.canvas.width, end[1] * ctx.canvas.height);
      ctx.stroke();
    };

    drawPoint(keypoints.leftHip);
    drawPoint(keypoints.leftKnee);
    drawPoint(keypoints.leftAnkle);
    drawLine(keypoints.leftHip, keypoints.leftKnee);
    drawLine(keypoints.leftKnee, keypoints.leftAnkle);
  };

  const processVideo = async (file: File) => {
    setStatus('Processando frames, por favor aguarde...');
    setLoading(true);
    setCsvUrl(null); 
    setKeypoints([]); 
    setCsvFileName(file.name.slice(0, 5) + '_pose_data.csv'); 

    if (videoRef.current) {
      videoRef.current.src = URL.createObjectURL(file);
      videoRef.current.load();

      const pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults((results: Results) => {
        if (results.poseLandmarks && canvasRef.current) {
          const landmarks = results.poseLandmarks as NormalizedLandmarkList;
          const leftHip: [number, number] = [landmarks[POSE_LANDMARKS_LEFT.LEFT_HIP].x, landmarks[POSE_LANDMARKS_LEFT.LEFT_HIP].y];
          const leftKnee: [number, number] = [landmarks[POSE_LANDMARKS_LEFT.LEFT_KNEE].x, landmarks[POSE_LANDMARKS_LEFT.LEFT_KNEE].y];
          const leftAnkle: [number, number] = [landmarks[POSE_LANDMARKS_LEFT.LEFT_ANKLE].x, landmarks[POSE_LANDMARKS_LEFT.LEFT_ANKLE].y];

          const angle = calculateAngle(leftHip, leftKnee, leftAnkle);

          const keypoint = {
            frameID: keypoints.length,
            leftHip,
            leftKnee,
            leftAnkle,
            angle,
          };

          setKeypoints((prevKeypoints) => [...prevKeypoints, keypoint]);

          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.drawImage(videoRef.current!, 0, 0, ctx.canvas.width, ctx.canvas.height);
            drawKeypoints(ctx, keypoint);
          }
        }
      });

      videoRef.current.onloadeddata = async () => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          //const ctx = canvas.getContext('2d')!;
          canvas.width = videoRef.current!.videoWidth;
          canvas.height = videoRef.current!.videoHeight;

          const processFrame = async () => {
            if (videoRef.current!.ended) {
              setStatus('Processamento concluído.');
              setLoading(false);
              return;
            }

            await pose.send({ image: videoRef.current! });
            videoRef.current!.currentTime += 1 / 30;
            setTimeout(processFrame, 0);
          };

          processFrame();
          videoRef.current!.play();
        }
      };
    }
  };

  useEffect(() => {
    if (!loading && keypoints.length > 0) {
      const csvContent = "data:text/csv;charset=utf-8," 
        + ["ID do Frame,Quadril Esquerdo,Joelho Esquerdo,Tornozelo Esquerdo,Ângulo"]
        .concat(keypoints.map(item => 
          `${item.frameID},${item.leftHip.join(';')},${item.leftKnee.join(';')},${item.leftAnkle.join(';')},${item.angle}`
        ))
        .join("\n");

      const encodedUri = encodeURI(csvContent);
      setCsvUrl(encodedUri);

      const audio = new Audio(AudioNotification); 
      audio.play();
    }
  }, [loading, keypoints]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processVideo(file);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md w-full max-w-3xl">
      <h3 className="text-lg font-semibold mb-2 text-gray-800">Selecione o vídeo que deseja processar</h3>
      <input 
        type="file" 
        accept="video/*" 
        onChange={handleFileChange} 
        className="mb-4 p-2 border border-gray-300 rounded bg-gray-50"
      />
      {status && <p className="text-center text-gray-700 mb-4">{status}</p>}
      {loading && (
        <div className="flex items-center justify-center mb-4">
          <svg className="w-8 h-8 animate-spin text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" d="M4 12a8 8 0 0 1 8-8V4a10 10 0 1 0 10 10h-2a8 8 0 0 1-8-8z"></path>
          </svg>
        </div>
      )}
      <div className="relative w-full" style={{ maxWidth: '640px' }}>
        <video ref={videoRef} className="mb-4 w-full border border-gray-300 rounded" muted></video>
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none"></canvas>
      </div>
      {csvUrl && (
        <a
          href={csvUrl}
          download={csvFileName}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded shadow-md hover:bg-green-600 transition"
        >
          Baixar CSV
        </a>
      )}
    </div>
  );
};

export default VideoProcessor;
