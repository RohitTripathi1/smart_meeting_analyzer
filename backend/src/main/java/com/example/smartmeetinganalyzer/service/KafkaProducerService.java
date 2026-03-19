package com.example.smartmeetinganalyzer.service;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducerService {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private static final String TOPIC = "meeting-transcripts";

    // Constructor Injection (how Spring gives us the Kafka postman!)
    public KafkaProducerService(KafkaTemplate<String, String> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendMeetingId(String meetingId) {
        System.out.println("--- PRODUCER: Sending meeting ID " + meetingId + " to Kafka topic: " + TOPIC + " ---");
        
        // This line actually pushes the envelope into our Kafka topic
        this.kafkaTemplate.send(TOPIC, meetingId);
    }
}
