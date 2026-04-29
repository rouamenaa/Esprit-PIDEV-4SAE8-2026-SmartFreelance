package com.example.micro_user.Service.auth;

import com.example.micro_user.Entity.User;
import com.example.micro_user.Repository.UserRepository;
<<<<<<< HEAD
=======
import org.springframework.security.authentication.DisabledException;
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25
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
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found");
        }
<<<<<<< HEAD
        System.out.println("Utilisateur connecté : ID = " + user.getId());
=======

        // ✅ Bloquer si le compte n'est pas encore confirmé
        if (!user.isEnabled()) {
            throw new DisabledException("Account not confirmed. Please check your email.");
        }

        System.out.println("Utilisateur connecté : ID = " + user.getId());


>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25
        return org.springframework.security.core.userdetails.User
                .builder()
                .username(user.getUsername())
                .password(user.getPassword())
<<<<<<< HEAD
                .roles(user.getRole().name()) // 🔥 important
                .build();

    }
    public Long getUserIdByUsername(String username) {
        User user = userRepository.findByUsername(username);  // Récupérer l'utilisateur depuis la base de données
        if (user != null) {
            return user.getId();  // Retourner l'ID de l'utilisateur
        }
        return null;
    }
    public String getUserRoleByUsername(String username) {
        User user = userRepository.findByUsername(username);  // Récupérer l'utilisateur depuis la base de données
        if (user != null) {
            return user.getRole().name();  // Retourner l'ID de l'utilisateur
=======
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
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25
        }
        return null;
    }
}
<<<<<<< HEAD
=======


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

>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25
