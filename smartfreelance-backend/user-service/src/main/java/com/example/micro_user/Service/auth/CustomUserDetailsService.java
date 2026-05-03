package com.example.micro_user.Service.auth;

import com.example.micro_user.Entity.User;
import com.example.micro_user.Entity.UserStatus;

import com.example.micro_user.Repository.UserRepository;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String     username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found");
        }

        // ✅ Bloquer si le compte n'est pas encore confirmé
        if (!user.isEnabled()) {
            throw new DisabledException("Account not confirmed. Please check your email.");
        }

        System.out.println("Utilisateur connecté : ID = " + user.getId());


        return org.springframework.security.core.userdetails.User
                .builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .roles(user.getRole().name())
                .build();
    }

    public Long getUserIdByUsername(String username) {
        User user = userRepository.findByUsername(username);
        if (user != null) {
            return user.getId();
        }
        return null;
    }

    public String getUserRoleByUsername(String username) {
        User user = userRepository.findByUsername(username);
        if (user != null) {
            return user.getRole().name();
        }
        return null;
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
        user.setProfileLevel(calculateLevel(user.getProfileCompletion()));
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

    private String calculateLevel(int score) {
        if(score < 40) return "WEAK";
        if(score < 80) return "MEDIUM";
        return "STRONG";
    }

    public User activateUser(Long id) {
        User user = userRepository.findById(id).orElseThrow();
        user.setStatus(UserStatus.ACTIVE);
        return userRepository.save(user);
    }

    public double calculateSuccessRate(int success, int total){
        if(total == 0) return 0;
        return (double) success / total * 100;
    }

}


//    public Long getUserIdByUsername(String username) {
//        User user = userRepository.findByUsername(username);  // Récupérer l'utilisateur depuis la base de données
//        if (user != null) {
//            return user.getId();  // Retourner l'ID de l'utilisateur
//        }
//        return null;
//    }
//    public String getUserRoleByUsername(String username) {
//        User user = userRepository.findByUsername(username);  // Récupérer l'utilisateur depuis la base de données
//        if (user != null) {
//            return user.getRole().name();  // Retourner l'ID de l'utilisateur
//        }
//        return null;
//    }

