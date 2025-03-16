# Face-API.js Models

This directory is where the face-api.js model files should be placed. These models are required for the facial detection and expression recognition features.

## Required Models

The application requires the following models:
- tiny_face_detector_model
- face_landmark_68_model
- face_recognition_model
- face_expression_model

## Automatic Setup

To automatically download the models, run:

```bash
cd frontend
npm run download-models
```

This will download all required models into this directory.

## Manual Setup

If you prefer to set up the models manually, follow these steps:

1. Create these directories inside the `models` folder:
   - `tiny_face_detector`
   - `face_landmark_68`
   - `face_recognition`
   - `face_expression`

2. Download the model files from the official face-api.js repository:
   https://github.com/justadudewhohacks/face-api.js/tree/master/weights

3. Place the model files in their respective directories.

## Model Structure

The final structure should look like this:

```
models/
├── face_expression/
│   └── face_expression_model-weights_manifest.json
│   └── face_expression_model-shard1.bin
├── face_landmark_68/
│   └── face_landmark_68_model-weights_manifest.json
│   └── face_landmark_68_model-shard1.bin
├── face_recognition/
│   └── face_recognition_model-weights_manifest.json
│   └── face_recognition_model-shard1.bin
│   └── face_recognition_model-shard2.bin
└── tiny_face_detector/
    └── tiny_face_detector_model-weights_manifest.json
    └── tiny_face_detector_model-shard1.bin
```

## Troubleshooting

If facial detection is not working:
1. Check the browser console for errors
2. Verify that all model files are correctly placed in their respective directories
3. Make sure the model paths in the code match the directory structure
