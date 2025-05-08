package com.example.storage;

import com.example.storage.config.TestMinioConfig;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@Import(TestMinioConfig.class)
@ActiveProfiles("test")
class StorageServiceApplicationTests {

	@Test
	void contextLoads() {
		// This will verify that the application context loads correctly
	}

}
