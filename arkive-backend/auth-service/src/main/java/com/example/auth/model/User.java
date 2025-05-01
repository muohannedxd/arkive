package com.example.auth.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
   private int id;
   private String name;
   private String email;
   private String role;
   private String position;
   private String department;
   private String phone;
   private String status;
   private String hire_date;
   private String created_at;
}
