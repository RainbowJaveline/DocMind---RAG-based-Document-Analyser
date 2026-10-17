package DocMind.backend;

import com.google.api.client.util.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

//    @Bean
//    CommandLineRunner checkGoogleConfig(
//            @Value("${spring.ai.google.genai.project-id:NOT_RESOLVED}") String projectId) {
//
//        return args -> System.out.println(
//                "Google GenAI Project ID configured: "
//                        + (projectId != null
//                        && !projectId.isBlank()
//                        && !projectId.equals("NOT_RESOLVED"))
//        );
//    }

}
