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

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

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
    public ResponseEntity<Map<String, String>> register(@RequestBody User user) {
        if (user.getRole() == Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You cannot register as ADMIN"));
        }

        // Vérifier si l'email existe déjà
        if (userRepository.findByEmail(user.getEmail()) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Email already exists"));
        }

        // Générer le token de confirmation
        String token = UUID.randomUUID().toString();
        user.setConfirmationToken(token);
        user.setEnabled(false);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setNom(user.getUsername());
        userRepository.save(user);

        try {
            // Envoyer l'email de confirmation
            emailService.sendConfirmationEmail(user.getEmail(), token);
        } catch (MailException ex) {
            // Transactional rollback: user is not persisted if email fails.
            throw new IllegalStateException(
                    "Unable to send confirmation email. Please verify SMTP configuration.",
                    ex
            );
        }

        return ResponseEntity.ok(Map.of("message",
                "Registration successful! Please check your email to confirm your account."));
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
<<<<<<< HEAD
=======

>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25
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
<<<<<<< HEAD

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
=======
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25
}
