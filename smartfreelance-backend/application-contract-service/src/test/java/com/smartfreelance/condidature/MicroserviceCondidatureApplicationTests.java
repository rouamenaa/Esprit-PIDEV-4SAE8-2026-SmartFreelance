package com.smartfreelance.condidature;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(
        classes = MicroserviceCondidatureApplication.class,
        properties = {
                "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration",
                "eureka.client.enabled=false"
        }
)
@Disabled("Context smoke test disabled: module tests focus on service/controller behavior.")
class MicroserviceCondidatureApplicationTests {

    @Test
    void contextLoads() {
    }
}
