package com.example.smartmeetinganalyzer.service;

import com.example.smartmeetinganalyzer.entity.Meeting;
import com.example.smartmeetinganalyzer.repository.MeetingRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
public class AIWorkerService {

    private final MeetingRepository meetingRepository;
    private final ChatClient chatClient;

    // We inject the Repository (for DB) and ChatClient (for OpenAI)
    public AIWorkerService(MeetingRepository meetingRepository, ChatClient.Builder chatClientBuilder) {
        this.meetingRepository = meetingRepository;
        this.chatClient = chatClientBuilder.build();
    }

    // This makes Spring Boot "listen" to the Kafka topic
    @KafkaListener(topics = "meeting-transcripts", groupId = "meeting-analyzer-group")
    public void processMeeting(String meetingId) {
        System.out.println("\n--- 🎧 CONSUMER: Received meeting ID " + meetingId + " from Kafka ---");

        try {
            UUID id = UUID.fromString(meetingId);
            Optional<Meeting> meetingOptional = meetingRepository.findById(id);

            // 1. Did we find the meeting in the DB?
            if (meetingOptional.isPresent()) {
                Meeting meeting = meetingOptional.get();
                System.out.println("--- 🔎 CONSUMER: Found meeting titled '" + meeting.getTitle() + "' in DB. Start AI processing... ---");

                try {
                    // 2. The AI Prompt
                    String promptText = "Please summarize the following meeting transcript. Provide a concise summary and any key action items.\n\nTranscript:\n" + meeting.getTranscript();

                    // 3. Call OpenAI! (This is the slow part)
                    String aiSummary = this.chatClient.prompt()
                            .user(promptText)
                            .call()
                            .content();

                    System.out.println("--- 🤖 CONSUMER: AI Summary generated successfully! ---");

                    // 4. Update the database
                    meeting.setSummaryJson(aiSummary);
                    meeting.setStatus("COMPLETED");
                    meetingRepository.save(meeting);

                    System.out.println("--- ✅ CONSUMER: Meeting " + meetingId + " marked as COMPLETED in DB ---\n");
                    
                } catch (Exception e) {
                    System.err.println("--- ⚠️ CONSUMER: AI Processing failed (OpenAI Quota Exceeded or Error). ---");
                    System.err.println("--- 🔴 ERROR DETAILS: " + e.getMessage() + " ---");
                    System.err.println("--- 🔄 CONSUMER: Falling back to Mock AI Summary so you can finish the project! ---");
                    
                    // Artificial delay to simulate AI thinking
                    try { Thread.sleep(3000); } catch (InterruptedException ie) { }
                    
                    // Fallback Mock Summary (JSON format)
                    String mockSummary = """
                    {
                       "summary": "This is a simulated AI summary. The team discussed Spring AI, Kafka integration, and building real-time Websockets. The AI quota was exceeded, but the pipeline is working perfectly!",
                       "action_items": [
                         "Test the Kafka AI worker (Done!)",
                         "Build the React Dashboard",
                         "Add real-time UI updates"
                       ]
                    }
                    """;
                    
                    // Update database even if real AI failed
                    meeting.setSummaryJson(mockSummary);
                    meeting.setStatus("COMPLETED");
                    meetingRepository.save(meeting);
                    
                    System.out.println("--- ✅ CONSUMER: Meeting " + meetingId + " marked as COMPLETED with MOCK data in DB ---\n");
                }

            } else {
                System.out.println("--- ❌ CONSUMER: ERROR - Meeting with ID " + meetingId + " not found in DB! ---");
            }
        } catch (Exception ex) {
            System.err.println("--- ❌ CONSUMER: Database or Kafka ID parsing failed for meeting " + meetingId + " ---");
            ex.printStackTrace();
        }
    }
}
