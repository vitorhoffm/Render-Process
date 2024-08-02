import cv2
import mediapipe as mp
import csv
import math
import tkinter as tk
from tkinter import filedialog, messagebox

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

def calculate_angle(a, b, c):
    angle = math.degrees(
        math.atan2(c[1] - b[1], c[0] - b[0]) - math.atan2(a[1] - b[1], a[0] - b[0])
    )
    angle = abs(angle)
    if angle > 180:
        angle = 360 - angle
    return angle

def process_frame(frame, frame_id, keypoints_array):
    image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = pose.process(image)
    
    if results.pose_landmarks:
        landmarks = results.pose_landmarks.landmark
        left_hip = [landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].x, landmarks[mp_pose.PoseLandmark.LEFT_HIP.value].y]
        left_knee = [landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value].y]
        left_ankle = [landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].x, landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value].y]
        
        angle = calculate_angle(left_hip, left_knee, left_ankle)
        
        keypoints_array.append({
            'frameID': frame_id,
            'leftHip': left_hip,
            'leftKnee': left_knee,
            'leftAnkle': left_ankle,
            'angle': angle
        })

def process_video(video_path, status_label):
    status_label.config(text="Processando frames, por favor aguarde...")
    status_label.update_idletasks()

    cap = cv2.VideoCapture(video_path)
    keypoints_array = []
    frame_id = 0

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        process_frame(frame, frame_id, keypoints_array)
        frame_id += 1

    cap.release()
    save_data_to_csv(keypoints_array)
    status_label.config(text="Processamento concluído.")
    messagebox.showinfo("Informação", "Processamento concluído e dados salvos em pose_data.csv")

def save_data_to_csv(data):
    with open('pose_data.csv', mode='w', newline='') as file:
        writer = csv.DictWriter(file, fieldnames=['ID do Frame', 'Quadril Esquerdo', 'Joelho Esquerdo', 'Tornozelo Esquerdo', 'Ângulo'])
        writer.writeheader()
        for item in data:
            writer.writerow({
                'ID do Frame': item['frameID'],
                'Quadril Esquerdo': item['leftHip'],
                'Joelho Esquerdo': item['leftKnee'],
                'Tornozelo Esquerdo': item['leftAnkle'],
                'Ângulo': item['angle']
            })

def start_capture(status_label):
    video_path = filedialog.askopenfilename()
    if video_path:
        process_video(video_path, status_label)

if __name__ == "__main__":
    root = tk.Tk()
    root.title("Pose Estimation")
    root.geometry("400x200")
    root.configure(bg="#f0f0f0")

    description = tk.Label(root, text="Para melhor precisão dos dados, o vídeo deve ser limpo e conter apenas a pessoa em movimento.",
                           wraplength=380, justify="center", bg="#f0f0f0", font=("Helvetica", 10))
    description.pack(pady=10)

    btn = tk.Button(root, text="Iniciar Captura", command=lambda: start_capture(status_label),
                    bg="#4CAF50", fg="white", font=("Helvetica", 12), padx=20, pady=10, borderwidth=2, relief="raised")
    btn.pack(pady=20)

    status_label = tk.Label(root, text="", bg="#f0f0f0", font=("Helvetica", 10))
    status_label.pack(pady=10)

    root.mainloop()
