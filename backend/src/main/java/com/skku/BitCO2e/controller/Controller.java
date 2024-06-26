package com.skku.BitCO2e.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skku.BitCO2e.DTO.*;
import com.skku.BitCO2e.patterns.Pattern1;
import com.skku.BitCO2e.patterns.Pattern2;
import com.skku.BitCO2e.patterns.Pattern3;
import com.skku.BitCO2e.patterns.Pattern4;
import com.skku.BitCO2e.patterns.Pattern5;
import com.skku.BitCO2e.patterns.Pattern6;
import com.skku.BitCO2e.patterns.Pattern7;
import com.skku.BitCO2e.patterns.Pattern8;
import com.skku.BitCO2e.patterns.Pattern9;
import com.skku.BitCO2e.patterns.Pattern10;
import com.skku.BitCO2e.patterns.Pattern11;
import com.skku.BitCO2e.security.UserDetailsImpl;
import com.skku.BitCO2e.service.AdvertisementService;
import com.skku.BitCO2e.service.BitService;
import com.skku.BitCO2e.service.CodeInputService;
import com.skku.BitCO2e.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class Controller {
    private final UserService userService;
    private final AdvertisementService advertisementService;
    private final BitService bitService;
    private final CodeInputService codeInputService;

    private final Pattern1 pattern1;
    private final Pattern2 pattern2;
    private final Pattern3 pattern3;
    private final Pattern4 pattern4;
    private final Pattern5 pattern5;
    private final Pattern6 pattern6;
    private final Pattern7 pattern7;
    private final Pattern8 pattern8;
    private final Pattern9 pattern9;
    private final Pattern10 pattern10;
    private final Pattern11 pattern11;

    @Autowired
    public Controller(UserService userService, AdvertisementService advertisementService, BitService bitService, CodeInputService codeInputService) {
        this.userService = userService;
        this.advertisementService = advertisementService;
        this.bitService = bitService;
        this.codeInputService = codeInputService;

        this.pattern1 = new Pattern1();
        this.pattern2 = new Pattern2();
        this.pattern3 = new Pattern3();
        this.pattern4 = new Pattern4();
        this.pattern5 = new Pattern5();
        this.pattern6 = new Pattern6();
        this.pattern7 = new Pattern7();
        this.pattern8 = new Pattern8();
        this.pattern9 = new Pattern9();
        this.pattern10 = new Pattern10();
        this.pattern11 = new Pattern11();

    }

    @PostMapping("/signup")
    public ResponseEntity<String> signup(UserRegisterDTO userRegisterDTO) {
        userService.createUser(userRegisterDTO);
        return ResponseEntity.ok("User signed up successfully.");
    }

    @GetMapping("/session")
    public UserSessionDTO session(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return userService.getUserSession(userDetails);
    }

    @GetMapping("/users")
    public List<UserInfoDTO> users(@RequestParam(defaultValue = "10") int limit) {
        return userService.findTopUsersByBits(limit);
    }


    @PostMapping("/refactoring")
    public String refactoring(@RequestBody String codeInput) {
        String refactor1 = pattern1.main(codeInput);
        boolean isPattern1 = refactor1.contains("public class Fixed");

        String refactor2 = pattern2.main(refactor1);
        boolean isPattern2 = !refactor1.equals(refactor2);

        String refactor3 = pattern3.main(refactor2);
        boolean isPattern3 = !refactor2.equals(refactor3);

        String refactor4 = pattern4.main(refactor3);
        boolean isPattern4 = !refactor3.equals(refactor4);

        boolean containsTempReturnPattern = refactor4.matches(".*int temp = .+;\\s*return temp;.*");
        String refactor5 = containsTempReturnPattern ? pattern5.main(refactor4) : refactor4;
        boolean isPattern5 = containsTempReturnPattern && !refactor4.equals(refactor5);

        String refactor6 = pattern6.main(refactor5);
        boolean isPattern6 = !refactor5.equals(refactor6);

        String refactor7 = pattern7.main(refactor6);
        boolean isPattern7 = !refactor6.equals(refactor7);

        String refactor8 = pattern8.main(refactor7);
        boolean isPattern8 = !refactor7.equals(refactor8);

        String refactor9 = pattern9.main(refactor8);
        boolean isPattern9 = !refactor8.equals(refactor9);

        String refactor10 = pattern10.main(refactor9);
        boolean isPattern10 = !refactor9.equals(refactor10);

        String refactor11 = pattern11.main(refactor10);
        boolean isPattern11 = !refactor10.equals(refactor11);

        Map<String, Object> response = new HashMap<>();
        response.put("isPattern1", isPattern1);
        response.put("isPattern2", isPattern2);
        response.put("isPattern3", isPattern3);
        response.put("isPattern4", isPattern4);
        response.put("isPattern5", isPattern5);
        response.put("isPattern6", isPattern6);
        response.put("isPattern7", isPattern7);
        response.put("isPattern8", isPattern8);
        response.put("isPattern9", isPattern9);
        response.put("isPattern10", isPattern10);
        response.put("isPattern11", isPattern11);

        response.put("code", refactor11);

        ObjectMapper objectMapper = new ObjectMapper();

        try {
            return objectMapper.writeValueAsString(response);
        } catch (Exception e) {
            throw new RuntimeException("Error converting response to JSON", e);
        }
    }

    @PostMapping("/bit")
    public void addBit(@RequestBody String userId) {
        bitService.addBits(userId, 10);
    }

    @PostMapping("/advertisement")
    public ResponseEntity<String> requestAd(@AuthenticationPrincipal UserDetailsImpl userDetails, @Validated AdvertisementRequestDTO advertisementRequestDTO) {
        String userId = userDetails.getUserId();

        if (advertisementRequestDTO.getImage().getSize() > 10 * 1024 * 1024) {
            throw new RuntimeException("Image size too large");
        }

        advertisementService.createAdvertisement(userId, advertisementRequestDTO);
        return ResponseEntity.ok("apply advertisement successfully.");
    }

    @GetMapping("/advertisements")
    public List<AdvertisementInfoDTO> getAdvertisementsByStatus(@RequestParam String status) {
        if (!status.equals("applied") && !status.equals("approved")) {
            throw new RuntimeException("Status is not valid");
        }

        return advertisementService.findAdvertisementsByStatus(status);
    }

    @PostMapping("/review")
    public ResponseEntity<String> reviewAd(@Validated ReviewDTO reviewDTO) {

        String status = reviewDTO.getStatus();
        // Validate status
        if (status == null ||(!status.equals("approved") && !status.equals("rejected"))) {
            return ResponseEntity.badRequest().body("Invalid status. Status must be either 'approved' or 'rejected'.");
        }

        advertisementService.reviewAdvertisement(reviewDTO);
        return ResponseEntity.ok("Review advertisement successfully.");
    }

    @PostMapping("/compare")
    public ResponseEntity<AnalyzeResponseDTO> compareAnalyzeCE(@RequestBody AnalyzeRequestDTO request) {
        try {
            AnalyzeResponseDTO response = codeInputService.compareCarbonEmissions(request);
            if (response.inputCarbonEmissions() == -1 || response.outputCarbonEmissions() == -1) {
                return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
            }
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            AnalyzeResponseDTO errorResponse = new AnalyzeResponseDTO((double) -1, (double) -1, -1, (double) -1, (double) -1);
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
