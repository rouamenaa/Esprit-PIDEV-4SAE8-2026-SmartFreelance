package com.example.micro_user.Controller;

import com.example.micro_user.Entity.Role;
import com.example.micro_user.Entity.User;
import com.example.micro_user.Entity.UserDTO;
import com.example.micro_user.Repository.UserRepository;
import com.example.micro_user.Service.auth.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
<<<<<<< HEAD
=======
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
>>>>>>> a084d154fb5e9c0f17cf6e3e48ec9b63dbf3dd50
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
<<<<<<< HEAD
import java.util.UUID;
=======
>>>>>>> a084d154fb5e9c0f17cf6e3e48ec9b63dbf3dd50

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userService;
<<<<<<< HEAD
    private final EmailService emailService; // ✅ Ajouté
=======
>>>>>>> a084d154fb5e9c0f17cf6e3e48ec9b63dbf3dd50

    @Autowired
    public AuthController(PasswordEncoder passwordEncoder,
                          UserRepository userRepository,
                          AuthenticationManager authenticationManager,
<<<<<<< HEAD
                          CustomUserDetailsService userService,
                          EmailService emailService) { // ✅ Ajouté
=======
                          CustomUserDetailsService userService) {
>>>>>>> a084d154fb5e9c0f17cf6e3e48ec9b63dbf3dd50

        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.authenticationManager = authenticationManager;
        this.userService = userService;
<<<<<<< HEAD
        this.emailService = emailService; // ✅ Ajouté
    }

=======
    }


>>>>>>> a084d154fb5e9c0f17cf6e3e48ec9b63dbf3dd50
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
<<<<<<< HEAD

    // ================= REGISTER =================
=======
    // ================= REGISTER =================

>>>>>>> a084d154fb5e9c0f17cf6e3e48ec9b63dbf3dd50
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody User user) {
        if (user.getRole() == Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You cannot register as ADMIN"));
        }
<<<<<<< HEAD

        // ✅ Vérifier si l'email existe déjà
        if (userRepository.findByEmail(user.getEmail()) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Email already exists"));
        }

        // ✅ Générer le token de confirmation
        String token = UUID.randomUUID().toString();
        user.setConfirmationToken(token);
        user.setEnabled(false); // compte désactivé jusqu'à confirmation
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);

        // ✅ Envoyer l'email de confirmation
        emailService.sendConfirmationEmail(user.getEmail(), token);

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
=======
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User registered successfully"));
>>>>>>> a084d154fb5e9c0f17cf6e3e48ec9b63dbf3dd50
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<UserDTO> authenticate(@RequestBody User user) {
<<<<<<< HEAD
=======


>>>>>>> a084d154fb5e9c0f17cf6e3e48ec9b63dbf3dd50
        User existingUser = userRepository.findByEmail(user.getEmail());

        if (existingUser == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

<<<<<<< HEAD
        // ✅ Bloquer si compte non confirmé
        if (!existingUser.isEnabled()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            existingUser.getUsername(),
=======
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            existingUser.getUsername(), // ✅ utilise le username trouvé
>>>>>>> a084d154fb5e9c0f17cf6e3e48ec9b63dbf3dd50
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
<<<<<<< HEAD

=======
>>>>>>> a084d154fb5e9c0f17cf6e3e48ec9b63dbf3dd50
    @PostMapping("/add")
    public ResponseEntity<User> addUser(@RequestBody User user) {
        return ResponseEntity.ok(userRepository.save(user));
    }

    // ================= GET USER BY ID =================
    @GetMapping("/user/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
<<<<<<< HEAD
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        User user = userOpt.get();
=======

        Optional<User> userOpt = userRepository.findById(id);

        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();

>>>>>>> a084d154fb5e9c0f17cf6e3e48ec9b63dbf3dd50
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
<<<<<<< HEAD
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        User existingUser = userOpt.get();
        existingUser.setUsername(updatedUser.getUsername());
        existingUser.setEmail(updatedUser.getEmail());

        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }
        if (updatedUser.getRole() != null && updatedUser.getRole() != Role.ADMIN) {
=======

        Optional<User> userOpt = userRepository.findById(id);

        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User existingUser = userOpt.get();

        existingUser.setUsername(updatedUser.getUsername());
        existingUser.setEmail(updatedUser.getEmail());

        if (updatedUser.getPassword() != null &&
                !updatedUser.getPassword().isEmpty()) {
            existingUser.setPassword(
                    passwordEncoder.encode(updatedUser.getPassword()));
        }

        if (updatedUser.getRole() != null &&
                updatedUser.getRole() != Role.ADMIN) {
>>>>>>> a084d154fb5e9c0f17cf6e3e48ec9b63dbf3dd50
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
<<<<<<< HEAD
        if (!userRepository.existsById(id)) return ResponseEntity.notFound().build();
=======

        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

>>>>>>> a084d154fb5e9c0f17cf6e3e48ec9b63dbf3dd50
        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    // ================= TEST =================
    @GetMapping("/test")
    public String test() {
        return "Backend working successfully 🚀";
    }
<<<<<<< HEAD
}
=======
}
>>>>>>> a084d154fb5e9c0f17cf6e3e48ec9b63dbf3dd50
