package com.example.micro_user.Controller;

import com.example.micro_user.Entity.Role;
import com.example.micro_user.Entity.User;
import com.example.micro_user.Entity.UserDTO;
import com.example.micro_user.Repository.UserRepository;
import com.example.micro_user.Service.auth.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.bind.annotation.*;
import com.example.micro_user.Service.auth.*;
import com.example.micro_user.Service.auth.FaceLoginRequest;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userService;
    private final EmailService emailService;

    @Autowired
    public AuthController(PasswordEncoder passwordEncoder,
                          UserRepository userRepository,
                          AuthenticationManager authenticationManager,
                          CustomUserDetailsService userService,
                          EmailService emailService) {

        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.emailService = emailService;

    }

    // ================= GET ALL =================
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // ================= REGISTER =================

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<Map<String, String>> register(@RequestBody Map<String, Object> body) {

        User user = new User();
        user.setUsername((String) body.get("username"));
        user.setEmail((String) body.get("email"));
        user.setPassword((String) body.get("password"));
        user.setFaceDescriptor((String) body.get("faceDescriptor"));

        // 🔥 GET CAPTCHA TOKEN FROM FRONTEND
        String captchaToken = (String) body.get("captchaToken");

        // ================= CAPTCHA VALIDATION =================
        if (captchaToken == null || !verifyCaptcha(captchaToken)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Captcha invalid ❌"));
        }

        // ================= EMAIL FORMAT VALIDATION =================
        if (user.getEmail() == null || !user.getEmail().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid email format ❌"));
        }

        // ================= CHECK EMAIL EXISTS =================
        if (userRepository.findByEmail(user.getEmail()) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Email already exists"));
        }

        // ================= FACE REQUIRED =================
        if (user.getFaceDescriptor() == null || user.getFaceDescriptor().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Face verification required"));
        }

        // ================= PREPARE USER =================
        user.setRole(Role.FREELANCER);
        user.setEnabled(false);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setNom(user.getUsername());

        String token = UUID.randomUUID().toString();
        user.setConfirmationToken(token);

        userRepository.save(user);

        // ================= SEND EMAIL =================
        try {
            emailService.sendConfirmationEmail(user.getEmail(), token);
        } catch (MailException ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Invalid email address or mail server error ❌"));
        }

        return ResponseEntity.ok(Map.of(
                "message", "Registration successful ✅ Check your email to confirm account"
        ));
    }

    // ================= CONFIRM EMAIL =================
    @GetMapping("/confirm")
    public ResponseEntity<Map<String, String>> confirmEmail(@RequestParam String token) {
        User user = userRepository.findByConfirmationToken(token);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Invalid or expired confirmation link"));
        }

        user.setEnabled(true);
        user.setConfirmationToken(null);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message",
                "Email confirmed successfully! You can now log in."));
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<UserDTO> authenticate(@RequestBody User user) {
        User existingUser = userRepository.findByEmail(user.getEmail());

        if (existingUser == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        // Bloquer si compte non confirmé
        if (!existingUser.isEnabled()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            existingUser.getUsername(),
                            user.getPassword()
                    )
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        String token = JwtUtils.generateToken(existingUser.getUsername());

        UserDTO dto = new UserDTO();
        dto.setId(existingUser.getId());
        dto.setUsername(existingUser.getUsername());
        dto.setEmail(existingUser.getEmail());
        dto.setRole(existingUser.getRole());
        dto.setToken(token);

        return ResponseEntity.ok(dto);
    }

    // ================= ADD (admin only) =================
    @PostMapping("/add")
    public ResponseEntity<User> addUser(@RequestBody User user) {
        return ResponseEntity.ok(userRepository.save(user));
    }

    // ================= GET USER BY ID =================
    @GetMapping("/user/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        User user = userOpt.get();
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());

        return ResponseEntity.ok(dto);
    }

    // ================= UPDATE USER =================
    @PutMapping("/user/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id,
                                              @RequestBody User updatedUser) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        User existingUser = userOpt.get();
        existingUser.setUsername(updatedUser.getUsername());
        existingUser.setEmail(updatedUser.getEmail());

        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }
        if (updatedUser.getRole() != null && updatedUser.getRole() != Role.ADMIN) {
            existingUser.setRole(updatedUser.getRole());
        }

        userRepository.save(existingUser);

        UserDTO dto = new UserDTO();
        dto.setId(existingUser.getId());
        dto.setUsername(existingUser.getUsername());
        dto.setEmail(existingUser.getEmail());
        dto.setRole(existingUser.getRole());

        return ResponseEntity.ok(dto);
    }

    // ================= DELETE USER =================
    @DeleteMapping("/user/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        if (!userRepository.existsById(id)) return ResponseEntity.notFound().build();
        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    // ================= TEST =================
    @GetMapping("/test")
    public String test() {
        return "Backend working successfully 🚀";
    }

    @PutMapping("/profile/{id}")
    public ResponseEntity<User> updateProfile(@PathVariable Long id,
                                              @RequestBody User user) {
        return ResponseEntity.ok(userService.updateProfile(id, user));
    }

    @PutMapping("/suspend/{id}")
    public ResponseEntity<User> suspend(@PathVariable Long id) {
        return ResponseEntity.ok(userService.suspendUser(id));
    }

    @PutMapping("/ban/{id}")
    public ResponseEntity<User> ban(@PathVariable Long id) {
        return ResponseEntity.ok(userService.banUser(id));
    }

    @PutMapping("/activate/{id}")
    public ResponseEntity<User> activate(@PathVariable Long id) {
        return ResponseEntity.ok(userService.activateUser(id));
    }

    @GetMapping("/freelancers")
    public ResponseEntity<java.util.List<User>> getFreelancersBySkill(
            @RequestParam String skill) {
        return ResponseEntity.ok(
                userRepository.findByRoleAndSkillsContaining(Role.FREELANCER, skill)
        );
    }

    @PostMapping("/upload")
    public String uploadFile(@RequestParam org.springframework.web.multipart.MultipartFile file) throws Exception {
        String path = "uploads/" + file.getOriginalFilename();
        file.transferTo(new java.io.File(path));
        return path;
    }

    @GetMapping("/stats/{id}")
    public User getUserStats(@PathVariable Long id){
        return userRepository.findById(id).orElseThrow();
    }

    @GetMapping("/freelancers/byPrice")
    public java.util.List<User> getByPrice(@RequestParam Double price){
        return userRepository.findByRoleAndHourlyRateLessThan(Role.FREELANCER, price);
    }

    @GetMapping("/freelancers/byRating")
    public java.util.List<User> getByRating(@RequestParam Double rating){
        return userRepository.findByRoleAndAverageRatingGreaterThan(Role.FREELANCER, rating);
    }
    @GetMapping("/face-test")
    public String faceTest() {
        return "FACE OK";
    }
    @PostMapping("/face-login")
    public ResponseEntity<?> faceLogin(@RequestBody FaceLoginRequest request) {

        System.out.println("=== FACE LOGIN ===");

        User user = userRepository.findByEmail(request.getEmail());

        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        if (!user.isEnabled()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Account not verified");
        }

        if (user.getFaceDescriptor() == null || user.getFaceDescriptor().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No face registered");
        }

        // 🔥 convert DB string → List<Float>
        List<Float> stored = parseDescriptor(user.getFaceDescriptor());

        List<Float> incoming = request.getDescriptor();

        if (incoming == null || incoming.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid face data");
        }

        if (stored.size() != incoming.size()) {
            return ResponseEntity.badRequest().body("Face data mismatch");
        }

        double distance = calculateDistance(stored, incoming);

        System.out.println("DISTANCE = " + distance);

        if (distance > 0.6) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Face not recognized");
        }

        String token = JwtUtils.generateToken(user.getUsername());

        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setToken(token);

        return ResponseEntity.ok(dto);
    }

    private List<Float> parseDescriptor(String json) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper =
                    new com.fasterxml.jackson.databind.ObjectMapper();

            // Case 1: normal array
            if (json.trim().startsWith("[")) {
                return mapper.readValue(
                        json,
                        new com.fasterxml.jackson.core.type.TypeReference<List<Float>>() {}
                );
            }

            // Case 2: object {"0":..., "1":...}
            Map<String, Float> map = mapper.readValue(
                    json,
                    new com.fasterxml.jackson.core.type.TypeReference<Map<String, Float>>() {}
            );

            // 🔥 convert map → ordered list
            List<Float> list = new ArrayList<>();

            for (int i = 0; i < map.size(); i++) {
                list.add(map.get(String.valueOf(i)));
            }

            return list;

        } catch (Exception e) {
            throw new RuntimeException("Error parsing face descriptor", e);
        }
    }

    private double calculateDistance(List<Float> a, List<Float> b) {
        double sum = 0.0;

        for (int i = 0; i < a.size(); i++) {
            double diff = a.get(i) - b.get(i);
            sum += diff * diff;
        }

        return Math.sqrt(sum);
    }
    private List<Float> convertStringToList(String descriptor) {
        if (descriptor == null || descriptor.isEmpty()) return null;

        String[] parts = descriptor.split(",");
        List<Float> list = new java.util.ArrayList<>();

        for (String p : parts) {
            list.add(Float.parseFloat(p));
        }

        return list;
    }
    public boolean verifyCaptcha(String token) {
        String url = "https://www.google.com/recaptcha/api/siteverify";

        RestTemplate restTemplate = new RestTemplate();

        // 🔥 IMPORTANT: send as FORM DATA, not JSON
        org.springframework.util.MultiValueMap<String, String> body =
                new org.springframework.util.LinkedMultiValueMap<>();

        body.add("secret", "6LcPusQsAAAAAGbDmG9RSGuqWBFWfAGU14YE9d2y"); // 🔴 PUT YOUR REAL SECRET KEY HERE
        body.add("response", token);

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED);

        org.springframework.http.HttpEntity<org.springframework.util.MultiValueMap<String, String>> request =
                new org.springframework.http.HttpEntity<>(body, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

        System.out.println("CAPTCHA RESPONSE = " + response.getBody());

        return Boolean.TRUE.equals(response.getBody().get("success"));
    }

}
