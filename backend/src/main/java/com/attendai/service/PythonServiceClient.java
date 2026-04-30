package com.attendai.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
public class PythonServiceClient {

    private static final Logger log = LoggerFactory.getLogger(PythonServiceClient.class);

    @Value("${python.service.url}")
    private String pythonUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public void trainModel() {
        try {
            ResponseEntity<String> res = restTemplate.postForEntity(pythonUrl + "/train", null, String.class);
            log.info("Training response: {}", res.getBody());
        } catch (Exception e) {
            log.warn("Python training failed: {}", e.getMessage());
            throw new RuntimeException("Python service training failed: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    public RecognitionResponse recognize(MultipartFile image) throws Exception {
        byte[] bytes = image.getBytes();
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("image", new ByteArrayResource(bytes) {
            @Override public String getFilename() { return "frame.jpg"; }
        });
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> res = restTemplate.postForEntity(pythonUrl + "/recognize", request, Map.class);
        Map<?, ?> data = res.getBody();
        boolean recognized = Boolean.TRUE.equals(data.get("recognized"));
        Object labelObj = data.get("label");
        Object confObj = data.get("confidence");
        int label = recognized && labelObj != null ? ((Number) labelObj).intValue() : -1;
        double confidence = confObj != null ? ((Number) confObj).doubleValue() : 999.0;
        return new RecognitionResponse(recognized, label, confidence);
    }

    public static class RecognitionResponse {
        private final boolean recognized;
        private final int label;
        private final double confidence;

        public RecognitionResponse(boolean recognized, int label, double confidence) {
            this.recognized = recognized;
            this.label = label;
            this.confidence = confidence;
        }

        public boolean isRecognized() { return recognized; }
        public int getLabel() { return label; }
        public double getConfidence() { return confidence; }
    }
}
