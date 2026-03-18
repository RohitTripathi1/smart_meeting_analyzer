package com.example.smartmeetinganalyzer.controller;

import com.example.smartmeetinganalyzer.entity.Meeting;
import com.example.smartmeetinganalyzer.repository.MeetingRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/meetings")
@CrossOrigin(origins = "*") // Allows our React frontend to talk to this API
public class MeetingController {

    private final MeetingRepository meetingRepository;

    // This is "Constructor Injection" - how we plug the Repository into the Controller!
    public MeetingController(MeetingRepository meetingRepository) {
        this.meetingRepository = meetingRepository;
    }

    // 1. POST: Create a new meeting (Upload Transcript)
    @PostMapping("/analyze")
    public ResponseEntity<Meeting> createMeeting(@RequestBody Meeting meeting) {
        meeting.setStatus("PENDING");
        Meeting savedMeeting = meetingRepository.save(meeting);
        
        // TODO: In the next step, we will also send this to KAFKA here!
        
        return ResponseEntity.ok(savedMeeting);
    }

    // 2. GET: List all meetings for the dashboard
    @GetMapping
    public List<Meeting> getAllMeetings() {
        return meetingRepository.findAll();
    }

    // 3. GET: Get details of one specific meeting
    @GetMapping("/{id}")
    public ResponseEntity<Meeting> getMeetingById(@PathVariable UUID id) {
        return meetingRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
