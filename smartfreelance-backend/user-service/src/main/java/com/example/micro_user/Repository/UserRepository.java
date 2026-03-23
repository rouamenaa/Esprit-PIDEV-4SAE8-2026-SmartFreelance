package com.example.micro_user.Repository;

import com.example.micro_user.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

<<<<<<< HEAD
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
    User findByEmail(String email);

    // ✅ Ajouté pour la confirmation email
    User findByConfirmationToken(String confirmationToken);
}
=======
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
  //  Optional<User> findByEmail(String email);
  User findByEmail(String email);

}
>>>>>>> a084d154fb5e9c0f17cf6e3e48ec9b63dbf3dd50
