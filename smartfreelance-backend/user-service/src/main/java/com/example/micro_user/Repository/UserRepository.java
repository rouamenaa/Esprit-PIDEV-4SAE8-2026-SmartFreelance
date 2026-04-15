package com.example.micro_user.Repository;

<<<<<<< HEAD
import com.example.micro_user.Entity.AvailabilityStatus;
import com.example.micro_user.Entity.Role;
=======
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25
import com.example.micro_user.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

<<<<<<< HEAD
import java.util.List;

=======
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
    User findByEmail(String email);
<<<<<<< HEAD
    
    List<User> findByRole(Role role);

    List<User> findByRoleAndSkillsContaining(Role role, String skill);

    List<User> findByAvailabilityStatus(AvailabilityStatus status);

    List<User> findByRoleAndHourlyRateLessThan(Role role, Double price);

    List<User> findByRoleAndAverageRatingGreaterThan(Role role, Double rating);
=======
>>>>>>> b230f03a4d557058bac697a597ff718c4e6e9e25

    // ✅ Ajouté pour la confirmation email
    User findByConfirmationToken(String confirmationToken);
}

