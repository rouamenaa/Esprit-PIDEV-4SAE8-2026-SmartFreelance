package com.example.micro_user.Service.auth;

import com.example.micro_user.Entity.Role;
import com.example.micro_user.Entity.User;
import com.example.micro_user.Entity.UserStatus;

import com.example.micro_user.Repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(User user) {

        if (userRepository.findByEmail(user.getEmail()) != null) {
            throw new RuntimeException("Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        if (user.getRole() == null) {
            user.setRole(Role.CLIENT);
        }

        return userRepository.save(user);
    }
    private int calculateCompletion(User user) {
        int score = 0;

        if (user.getBio() != null) score += 20;
        if (user.getSkills() != null && !user.getSkills().isEmpty()) score += 20;
        if (user.getExperienceLevel() != null) score += 20;
        if (user.getHourlyRate() != null) score += 20;
        if (user.getAvailabilityStatus() != null) score += 20;

        return score;
    }

    public User updateProfile(Long id, User updated) {
        User user = userRepository.findById(id).orElseThrow();

        user.setBio(updated.getBio());
        user.setSkills(updated.getSkills());
        user.setExperienceLevel(updated.getExperienceLevel());
        user.setHourlyRate(updated.getHourlyRate());
        user.setAvailabilityStatus(updated.getAvailabilityStatus());

        user.setProfileCompletion(calculateCompletion(user));

        return userRepository.save(user);
    }

    public User suspendUser(Long id) {
        User user = userRepository.findById(id).orElseThrow();
        user.setStatus(UserStatus.SUSPENDED);
        return userRepository.save(user);
    }

    public User banUser(Long id) {
        User user = userRepository.findById(id).orElseThrow();
        user.setStatus(UserStatus.BANNED);
        return userRepository.save(user);
    }

    public void softDelete(Long id) {
        User user = userRepository.findById(id).orElseThrow();
        user.setDeleted(true);
        userRepository.save(user);
    }
}
