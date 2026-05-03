package com.example.micro_user.Repository;

import com.example.micro_user.Entity.AvailabilityStatus;
import com.example.micro_user.Entity.Role;
import com.example.micro_user.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
    User findByEmail(String email);

    List<User> findByRole(Role role);

    List<User> findByRoleAndSkillsContaining(Role role, String skill);

    List<User> findByAvailabilityStatus(AvailabilityStatus status);

    List<User> findByRoleAndHourlyRateLessThan(Role role, Double price);

    List<User> findByRoleAndAverageRatingGreaterThan(Role role, Double rating);

    // ✅ Ajouté pour la confirmation email
    User findByConfirmationToken(String confirmationToken);
}

